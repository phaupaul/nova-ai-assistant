class NovaAIAssistant {
    constructor() {
        this.currentTab = null;
        this.conversationHistory = [];
        this.tokenCount = 0;
        this.maxTokens = 8000;
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadSettings();
        this.getCurrentTab();
    }

    initializeElements() {
        this.elements = {
            chatHistory: document.getElementById('chatHistory'),
            userInput: document.getElementById('userInput'),
            sendBtn: document.getElementById('sendBtn'),
            loadingIndicator: document.getElementById('loadingIndicator'),
            errorMessage: document.getElementById('errorMessage'),
            errorText: document.getElementById('errorText'),
            tokenCount: document.getElementById('tokenCount'),
            statusDot: document.getElementById('statusDot'),
            settingsBtn: document.getElementById('settingsBtn'),
            currentModel: document.getElementById('currentModel')
        };
    }

    setupEventListeners() {
        // Send message
        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        this.elements.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Quick actions
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.performQuickAction(action);
            });
        });

        // Settings
        this.elements.settingsBtn.addEventListener('click', () => {
            chrome.runtime.openOptionsPage();
        });

        // Auto-resize textarea
        this.elements.userInput.addEventListener('input', (e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
        });
    }

    async loadSettings() {
        try {
            const syncSettings = await chrome.storage.sync.get(['selectedModel']);
            const localSettings = await chrome.storage.local.get(['novaApiKey']);
            const settings = { ...syncSettings, ...localSettings };

            if (!settings.novaApiKey) {
                this.showError('Click the settings button (⚙️) to configure your Nova API key for AI responses.');
                this.elements.statusDot.className = 'status-dot error';
                
                // Add helpful message to chat
                this.addMessage('Welcome! To use AI features, please configure your Nova API key in settings.', 'ai');
                return;
            }

            this.elements.currentModel.textContent = settings.selectedModel || 'Nova Orchestrator';
            this.elements.statusDot.className = 'status-dot';
            
            // Add welcome message for configured users
            this.addMessage('Hello! I\'m your Nova AI Assistant. Ask me anything about this webpage or general questions. I can summarize, explain, translate, and more!', 'ai');
        } catch (error) {
            this.showError('Failed to load settings: ' + error.message);
        }
    }

    async getCurrentTab() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            this.currentTab = tab;
        } catch (error) {
            this.showError('Failed to get current tab: ' + error.message);
        }
    }

    async sendMessage() {
        const message = this.elements.userInput.value.trim();
        if (!message) return;

        this.addMessage(message, 'user');
        this.elements.userInput.value = '';
        this.elements.userInput.style.height = 'auto';
        this.showLoading(true);

        try {
            const pageContent = await this.getPageContent();
            const response = await this.callNovaAPI(message, pageContent);
            
            this.addMessage(response, 'ai');
            this.conversationHistory.push({ user: message, ai: response });
            this.updateTokenCount();
        } catch (error) {
            this.showError('Failed to get response: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async performQuickAction(action) {
        const actionPrompts = {
            summarize: 'Please provide a concise summary of this webpage content, highlighting the main points and key information.',
            explain: 'Explain this webpage content in simple terms, as if explaining to someone who is not familiar with the topic.',
            translate: 'Translate the main content of this webpage to Spanish. If the content is already in Spanish, translate it to English.',
            keypoints: 'Extract and list the key points, main arguments, or important takeaways from this webpage content.',
            questions: 'Generate 3-5 thoughtful questions that someone might ask about this webpage content, and provide brief answers.',
            images: 'Analyze any images visible on this webpage and describe what they show and how they relate to the content.'
        };

        const prompt = actionPrompts[action];
        if (!prompt) return;

        this.addMessage(`Quick Action: ${action.charAt(0).toUpperCase() + action.slice(1)}`, 'user');
        this.showLoading(true);

        try {
            const pageContent = await this.getPageContent(action === 'images');
            const response = await this.callNovaAPI(prompt, pageContent, action === 'images');
            
            this.addMessage(response, 'ai');
            this.conversationHistory.push({ user: prompt, ai: response });
            this.updateTokenCount();
        } catch (error) {
            this.showError('Failed to perform action: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async getPageContent(includeImages = false) {
        try {
            if (!this.currentTab) {
                throw new Error('No active tab found');
            }

            // For general questions (not page-specific), return minimal page context
            const response = await chrome.tabs.sendMessage(this.currentTab.id, {
                action: 'getPageContent',
                includeImages: includeImages
            });

            if (!response || !response.success) {
                // If we can't get page content, return basic page info
                return {
                    url: this.currentTab.url,
                    title: this.currentTab.title,
                    text: '',
                    headings: [],
                    metadata: {}
                };
            }

            return response.data;
        } catch (error) {
            // If content script injection fails, try to inject it
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: this.currentTab.id },
                    files: ['content.js']
                });
                
                // Wait a moment for injection
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Retry after injection
                const response = await chrome.tabs.sendMessage(this.currentTab.id, {
                    action: 'getPageContent',
                    includeImages: includeImages
                });

                if (!response || !response.success) {
                    // Return basic info if content extraction fails
                    return {
                        url: this.currentTab.url,
                        title: this.currentTab.title,
                        text: '',
                        headings: [],
                        metadata: {}
                    };
                }

                return response.data;
            } catch (injectionError) {
                // For restricted pages, return basic page info only
                return {
                    url: this.currentTab.url || 'Unknown page',
                    title: this.currentTab.title || 'Unknown title',
                    text: '',
                    headings: [],
                    metadata: {}
                };
            }
        }
    }

    async callNovaAPI(userMessage, pageContent, multimodal = false) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                action: 'callNova',
                data: {
                    userMessage,
                    pageContent,
                    multimodal,
                    conversationHistory: this.conversationHistory.slice(-5) // Last 5 exchanges
                }
            }, (response) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                }

                if (!response || !response.success) {
                    reject(new Error(response?.error || 'Unknown error occurred'));
                    return;
                }

                resolve(response.data);
            });
        });
    }

    addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.textContent = content;
        
        this.elements.chatHistory.appendChild(messageDiv);
        this.elements.chatHistory.scrollTop = this.elements.chatHistory.scrollHeight;
    }

    showLoading(show) {
        this.elements.loadingIndicator.style.display = show ? 'flex' : 'none';
        this.elements.sendBtn.disabled = show;
        
        // Disable quick action buttons during loading
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.disabled = show;
        });
    }

    showError(message) {
        this.elements.errorText.textContent = message;
        this.elements.errorMessage.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.elements.errorMessage.style.display = 'none';
        }, 5000);
    }

    updateTokenCount() {
        // Estimate token count (rough approximation)
        const totalText = this.conversationHistory
            .map(h => h.user + h.ai)
            .join(' ');
        this.tokenCount = Math.ceil(totalText.length / 4); // Rough estimate
        this.elements.tokenCount.textContent = this.tokenCount.toLocaleString();
        
        // Update status based on token usage
        if (this.tokenCount > this.maxTokens * 0.8) {
            this.elements.statusDot.className = 'status-dot warning';
        }
    }
}

// Initialize the assistant when popup loads
document.addEventListener('DOMContentLoaded', () => {
    new NovaAIAssistant();
});
