class NovaSidePanel {
    constructor() {
        this.currentConversationId = null;
        this.conversations = [];
        this.currentMessages = [];
        this.selectedTabs = new Set();
        this.allTabs = [];
        this.currentTab = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadSettings();
        this.loadConversations();
        this.refreshTabList();
    }

    initializeElements() {
        this.elements = {
            // Sidebar
            sidebar: document.getElementById('sidebar'),
            toggleSidebarBtn: document.getElementById('toggleSidebarBtn'),
            closeSidebarBtn: document.getElementById('closeSidebarBtn'),
            newChatFromSidebar: document.getElementById('newChatFromSidebar'),
            conversationList: document.getElementById('conversationList'),
            
            // Header
            chatTitle: document.getElementById('chatTitle'),
            newChatBtn: document.getElementById('newChatBtn'),
            settingsBtn: document.getElementById('settingsBtn'),
            
            // Error
            errorMessage: document.getElementById('errorMessage'),
            errorText: document.getElementById('errorText'),
            closeError: document.getElementById('closeError'),
            
            // Context
            toggleContext: document.getElementById('toggleContext'),
            contextPanel: document.getElementById('contextPanel'),
            contextBadge: document.getElementById('contextBadge'),
            currentPageCheck: document.getElementById('currentPageCheck'),
            currentPageTitle: document.getElementById('currentPageTitle'),
            refreshTabsBtn: document.getElementById('refreshTabsBtn'),
            otherPagesList: document.getElementById('otherPagesList'),
            
            // Chat
            chatMessages: document.getElementById('chatMessages'),
            quickActionsGrid: document.getElementById('quickActionsGrid'),
            
            // Input
            userInput: document.getElementById('userInput'),
            sendBtn: document.getElementById('sendBtn'),
            loadingIndicator: document.getElementById('loadingIndicator')
        };
    }

    setupEventListeners() {
        // Sidebar
        this.elements.toggleSidebarBtn.addEventListener('click', () => this.toggleSidebar());
        this.elements.closeSidebarBtn.addEventListener('click', () => this.toggleSidebar());
        this.elements.newChatFromSidebar.addEventListener('click', () => this.startNewChat());
        
        // Header
        this.elements.newChatBtn.addEventListener('click', () => this.startNewChat());
        this.elements.settingsBtn.addEventListener('click', () => chrome.runtime.openOptionsPage());
        
        // Error
        this.elements.closeError.addEventListener('click', () => {
            this.elements.errorMessage.style.display = 'none';
        });
        
        // Context
        this.elements.toggleContext.addEventListener('click', () => this.toggleContextPanel());
        this.elements.currentPageCheck.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.selectedTabs.add('current');
            } else {
                this.selectedTabs.delete('current');
            }
            this.updateContextBadge();
        });
        this.elements.refreshTabsBtn.addEventListener('click', () => this.refreshTabList());
        
        // Input
        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        this.elements.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-resize textarea
        this.elements.userInput.addEventListener('input', (e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
        });
        
        // Tab updates
        chrome.tabs.onActivated.addListener(() => this.refreshTabList());
        chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
            if (changeInfo.status === 'complete') this.refreshTabList();
        });
        chrome.tabs.onRemoved.addListener(() => this.refreshTabList());
    }

    async loadSettings() {
        try {
            const syncSettings = await chrome.storage.sync.get(['customQuickActions']);
            const localSettings = await chrome.storage.local.get(['novaApiKey']);
            
            if (!localSettings.novaApiKey) {
                this.showError('Please configure your Nova API key in settings (click the gear icon)');
            }
            
            // Load quick actions
            const quickActions = syncSettings.customQuickActions || this.getDefaultQuickActions();
            this.renderQuickActions(quickActions);
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    getDefaultQuickActions() {
        return [
            { label: 'Summarize', prompt: 'Please summarize the main points of this page.' },
            { label: 'Explain', prompt: 'Explain this content in simple terms.' },
            { label: 'Key Points', prompt: 'Extract the key points from this page.' },
            { label: 'Translate', prompt: 'Translate this content to Spanish.' }
        ];
    }

    renderQuickActions(actions) {
        this.elements.quickActionsGrid.innerHTML = '';
        actions.forEach(action => {
            const btn = document.createElement('button');
            btn.className = 'quick-action-btn';
            btn.innerHTML = `
                <i class="fas fa-bolt"></i>
                <span>${action.label}</span>
            `;
            btn.addEventListener('click', () => this.performQuickAction(action.prompt, action.label));
            this.elements.quickActionsGrid.appendChild(btn);
        });
    }

    // Conversation management
    async loadConversations() {
        try {
            const result = await chrome.storage.local.get(['conversations']);
            this.conversations = result.conversations || [];
            this.renderConversations();
        } catch (error) {
            console.error('Failed to load conversations:', error);
        }
    }

    async saveConversations() {
        try {
            await chrome.storage.local.set({ conversations: this.conversations });
        } catch (error) {
            console.error('Failed to save conversations:', error);
        }
    }

    renderConversations() {
        if (this.conversations.length === 0) {
            this.elements.conversationList.innerHTML = `
                <div class="empty-conversations">
                    <i class="fas fa-comments"></i>
                    <p>No conversations yet</p>
                </div>
            `;
            return;
        }
        
        this.elements.conversationList.innerHTML = '';
        this.conversations.forEach(conv => {
            const item = document.createElement('div');
            item.className = 'conversation-item';
            if (conv.id === this.currentConversationId) {
                item.classList.add('active');
            }
            
            const date = new Date(conv.timestamp);
            const dateStr = this.formatDate(date);
            
            item.innerHTML = `
                <div class="conversation-title">${conv.title}</div>
                <div class="conversation-date">${dateStr}</div>
                <button class="conversation-delete" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.conversation-delete')) {
                    this.loadConversation(conv.id);
                }
            });
            
            const deleteBtn = item.querySelector('.conversation-delete');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteConversation(conv.id);
            });
            
            this.elements.conversationList.appendChild(item);
        });
    }

    formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) {
            return 'Today';
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return `${days} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    startNewChat() {
        this.currentConversationId = null;
        this.currentMessages = [];
        this.elements.chatTitle.textContent = 'New Chat';
        this.renderMessages();
        this.renderConversations();
        this.elements.userInput.focus();
        
        // Close sidebar on mobile
        if (window.innerWidth <= 600) {
            this.elements.sidebar.classList.add('collapsed');
        }
    }

    loadConversation(id) {
        const conv = this.conversations.find(c => c.id === id);
        if (!conv) return;
        
        this.currentConversationId = id;
        this.currentMessages = conv.messages;
        this.elements.chatTitle.textContent = conv.title;
        this.renderMessages();
        this.renderConversations();
        
        // Close sidebar on mobile
        if (window.innerWidth <= 600) {
            this.elements.sidebar.classList.add('collapsed');
        }
    }

    deleteConversation(id) {
        if (!confirm('Delete this conversation?')) return;
        
        this.conversations = this.conversations.filter(c => c.id !== id);
        this.saveConversations();
        
        if (this.currentConversationId === id) {
            this.startNewChat();
        } else {
            this.renderConversations();
        }
    }

    saveCurrentConversation() {
        if (this.currentMessages.length === 0) return;
        
        const title = this.generateTitle(this.currentMessages[0].user);
        
        if (this.currentConversationId) {
            // Update existing
            const conv = this.conversations.find(c => c.id === this.currentConversationId);
            if (conv) {
                conv.messages = this.currentMessages;
                conv.timestamp = Date.now();
            }
        } else {
            // Create new
            this.currentConversationId = Date.now().toString();
            this.conversations.unshift({
                id: this.currentConversationId,
                title: title,
                messages: this.currentMessages,
                timestamp: Date.now()
            });
            
            // Keep only last 50 conversations
            if (this.conversations.length > 50) {
                this.conversations = this.conversations.slice(0, 50);
            }
        }
        
        this.elements.chatTitle.textContent = title;
        this.saveConversations();
        this.renderConversations();
    }

    generateTitle(firstMessage) {
        const maxLength = 40;
        if (firstMessage.length <= maxLength) {
            return firstMessage;
        }
        return firstMessage.substring(0, maxLength) + '...';
    }

    // Message handling
    async sendMessage() {
        const message = this.elements.userInput.value.trim();
        if (!message) return;
        
        // Check API key
        const settings = await chrome.storage.local.get(['novaApiKey']);
        if (!settings.novaApiKey) {
            this.showError('Please configure your Nova API key in settings');
            return;
        }
        
        // Add user message
        this.addMessage(message, 'user');
        this.elements.userInput.value = '';
        this.elements.userInput.style.height = 'auto';
        
        this.showLoading(true);
        
        try {
            const pageContents = this.selectedTabs.size > 0 
                ? await this.getSelectedTabsContent() 
                : [];
            
            const response = await this.callNovaAPI(message, pageContents);
            this.addMessage(response, 'ai');
            
            // Save conversation
            this.saveCurrentConversation();
        } catch (error) {
            console.error('API call error:', error);
            this.showError('Failed to get response: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async performQuickAction(prompt, label) {
        this.elements.userInput.value = prompt;
        await this.sendMessage();
    }

    addMessage(content, type) {
        // Store in current messages
        if (type === 'user') {
            this.currentMessages.push({ user: content, ai: '' });
        } else {
            this.currentMessages[this.currentMessages.length - 1].ai = content;
        }
        
        this.renderMessages();
    }

    renderMessages() {
        // Clear welcome message
        const welcome = this.elements.chatMessages.querySelector('.welcome-message');
        if (welcome && this.currentMessages.length > 0) {
            welcome.remove();
        }
        
        // Render all messages
        this.elements.chatMessages.innerHTML = '';
        
        if (this.currentMessages.length === 0) {
            this.elements.chatMessages.innerHTML = `
                <div class="welcome-message">
                    <i class="fas fa-robot"></i>
                    <h2>Hello! I'm Nova</h2>
                    <p>Ask me anything or use a quick action below</p>
                </div>
            `;
            return;
        }
        
        this.currentMessages.forEach(exchange => {
            // User message
            const userMsg = document.createElement('div');
            userMsg.className = 'message user-message';
            userMsg.innerHTML = `
                <div class="message-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">${this.escapeHtml(exchange.user)}</div>
                </div>
            `;
            this.elements.chatMessages.appendChild(userMsg);
            
            // AI message
            if (exchange.ai) {
                const aiMsg = document.createElement('div');
                aiMsg.className = 'message ai-message';
                aiMsg.innerHTML = `
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <div class="message-text">${this.formatMarkdown(exchange.ai)}</div>
                    </div>
                `;
                this.elements.chatMessages.appendChild(aiMsg);
            }
        });
        
        // Scroll to bottom
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatMarkdown(content) {
        let formatted = this.escapeHtml(content);
        
        // Code blocks (must be before inline code)
        formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        
        // Inline code
        formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Bold (must be before italic)
        formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/__(.+?)__/g, '<strong>$1</strong>');
        
        // Italic
        formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
        formatted = formatted.replace(/_(.+?)_/g, '<em>$1</em>');
        
        // Headers (must be at start of line) - remove the hashtags
        formatted = formatted.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
        formatted = formatted.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
        formatted = formatted.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
        formatted = formatted.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
        
        // Links
        formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // Process lists
        const lines = formatted.split('\n');
        const processed = [];
        let inList = false;
        let listType = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Numbered list
            if (/^\d+\.\s+(.+)/.test(line)) {
                const content = line.replace(/^\d+\.\s+/, '');
                if (!inList || listType !== 'ol') {
                    if (inList) processed.push(`</${listType}>`);
                    processed.push('<ol>');
                    inList = true;
                    listType = 'ol';
                }
                processed.push(`<li>${content}</li>`);
            }
            // Bullet list
            else if (/^[-*]\s+(.+)/.test(line)) {
                const content = line.replace(/^[-*]\s+/, '');
                if (!inList || listType !== 'ul') {
                    if (inList) processed.push(`</${listType}>`);
                    processed.push('<ul>');
                    inList = true;
                    listType = 'ul';
                }
                processed.push(`<li>${content}</li>`);
            }
            // Not a list item
            else {
                if (inList && line === '') {
                    processed.push(`</${listType}>`);
                    inList = false;
                    listType = null;
                }
                processed.push(line);
            }
        }
        
        // Close any open list
        if (inList) {
            processed.push(`</${listType}>`);
        }
        
        formatted = processed.join('\n');
        
        // Line breaks - convert single newlines to <br>, but not inside lists/headers
        formatted = formatted.replace(/\n(?!<[uo]l>|<\/[uo]l>|<li>|<\/li>|<h[1-6]>|<\/h[1-6]>)/g, '<br>');
        
        // Clean up extra breaks
        formatted = formatted.replace(/<br>\s*<br>/g, '<br><br>');
        
        return formatted;
    }

    async callNovaAPI(userMessage, pageContents) {
        return new Promise((resolve, reject) => {
            // Filter conversation history to only include complete exchanges
            const completeHistory = this.currentMessages.filter(exchange => 
                exchange.user && exchange.user.trim() && exchange.ai && exchange.ai.trim()
            );
            
            chrome.runtime.sendMessage({
                action: 'callNova',
                data: {
                    userMessage,
                    pageContent: pageContents.length === 1 ? pageContents[0].content : pageContents,
                    multimodal: false,
                    conversationHistory: completeHistory.slice(-5)
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

    // Tab management
    async refreshTabList() {
        try {
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            this.currentTab = activeTab;
            
            this.elements.currentPageTitle.textContent = activeTab.title || 'Current Page';
            
            const allTabs = await chrome.tabs.query({ currentWindow: true });
            this.allTabs = allTabs.filter(tab => tab.id !== activeTab.id);
            
            this.renderOtherTabs();
            this.updateContextBadge();
        } catch (error) {
            console.error('Failed to refresh tabs:', error);
        }
    }

    renderOtherTabs() {
        this.elements.otherPagesList.innerHTML = '';
        
        if (this.allTabs.length === 0) {
            this.elements.otherPagesList.innerHTML = '<div style="padding: 8px; text-align: center; color: var(--text-tertiary); font-size: 12px;">No other tabs</div>';
            return;
        }
        
        this.allTabs.forEach(tab => {
            const item = document.createElement('div');
            item.className = 'context-item';
            
            const isSelected = this.selectedTabs.has(tab.id);
            
            item.innerHTML = `
                <input type="checkbox" class="context-checkbox" id="tab-${tab.id}" ${isSelected ? 'checked' : ''}>
                <label for="tab-${tab.id}" class="context-label">
                    <i class="fas fa-file"></i>
                    <span>${this.truncateTitle(tab.title || 'Untitled')}</span>
                </label>
            `;
            
            const checkbox = item.querySelector('input');
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.selectedTabs.add(tab.id);
                } else {
                    this.selectedTabs.delete(tab.id);
                }
                this.updateContextBadge();
            });
            
            this.elements.otherPagesList.appendChild(item);
        });
    }

    truncateTitle(title, maxLength = 35) {
        if (title.length <= maxLength) return title;
        return title.substring(0, maxLength - 3) + '...';
    }

    async getSelectedTabsContent() {
        const contents = [];
        
        for (const tabId of this.selectedTabs) {
            try {
                let tab;
                if (tabId === 'current') {
                    tab = this.currentTab;
                } else {
                    tab = this.allTabs.find(t => t.id === tabId);
                }
                
                if (tab) {
                    const content = await this.getTabContent(tab);
                    contents.push({
                        tabId: tab.id,
                        title: tab.title,
                        url: tab.url,
                        content: content
                    });
                }
            } catch (error) {
                console.error(`Failed to get content for tab ${tabId}:`, error);
            }
        }
        
        return contents;
    }

    async getTabContent(tab) {
        try {
            const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'getPageContent',
                includeImages: false
            });
            
            if (response && response.success) {
                return response.data;
            }
            throw new Error('Failed to get page content');
        } catch (error) {
            // Try injecting content script
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js']
                });
                
                await new Promise(resolve => setTimeout(resolve, 100));
                
                const response = await chrome.tabs.sendMessage(tab.id, {
                    action: 'getPageContent',
                    includeImages: false
                });
                
                if (response && response.success) {
                    return response.data;
                }
            } catch (injectionError) {
                // Return basic info for restricted pages
                return {
                    url: tab.url || 'Unknown',
                    title: tab.title || 'Unknown',
                    text: 'Unable to extract content from this page.',
                    headings: [],
                    metadata: {}
                };
            }
        }
    }

    // UI helpers
    toggleSidebar() {
        this.elements.sidebar.classList.toggle('collapsed');
    }

    toggleContextPanel() {
        const isExpanded = this.elements.contextPanel.style.display !== 'none';
        this.elements.contextPanel.style.display = isExpanded ? 'none' : 'block';
        this.elements.toggleContext.classList.toggle('expanded', !isExpanded);
    }

    updateContextBadge() {
        const count = this.selectedTabs.size;
        this.elements.contextBadge.textContent = count;
        this.elements.contextBadge.style.display = count > 0 ? 'block' : 'none';
    }

    showLoading(show) {
        this.elements.loadingIndicator.style.display = show ? 'flex' : 'none';
        this.elements.sendBtn.disabled = show;
    }

    showError(message) {
        this.elements.errorText.textContent = message;
        this.elements.errorMessage.style.display = 'flex';
        
        setTimeout(() => {
            this.elements.errorMessage.style.display = 'none';
        }, 5000);
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new NovaSidePanel());
} else {
    new NovaSidePanel();
}
