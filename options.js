class SettingsManager {
    constructor() {
        this.elements = this.initializeElements();
        this.setupEventListeners();
        this.loadSettings();
    }

    initializeElements() {
        return {
            // Nova API Configuration
            novaApiKey: document.getElementById('novaApiKey'),
            selectedModel: document.getElementById('selectedModel'),
            
            // System Prompt
            systemPrompt: document.getElementById('systemPrompt'),
            
            // Quick Actions
            quickActionsList: document.getElementById('quickActionsList'),
            addQuickActionBtn: document.getElementById('addQuickAction'),
            
            // Actions
            testConnection: document.getElementById('testConnection'),
            saveSettings: document.getElementById('saveSettings'),
            statusMessage: document.getElementById('statusMessage')
        };
    }

    setupEventListeners() {
        // Test connection
        this.elements.testConnection.addEventListener('click', () => {
            this.testConnection();
        });

        // Save settings
        this.elements.saveSettings.addEventListener('click', () => {
            this.saveSettings();
        });

        // Toggle password visibility for Nova API key
        this.addPasswordToggle('novaApiKey');
        
        // Quick Actions
        this.elements.addQuickActionBtn.addEventListener('click', () => {
            this.addQuickAction();
        });
        
        // System prompt auto-save
        this.elements.systemPrompt.addEventListener('input', () => {
            this.autoSaveSystemPrompt();
        });
    }

    addPasswordToggle(fieldId) {
        const field = this.elements[fieldId];
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        const eyeIcon = document.createElement('span');
        eyeIcon.textContent = '👁️';
        toggleBtn.appendChild(eyeIcon);
        toggleBtn.style.cssText = `
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #666;
            cursor: pointer;
            padding: 4px;
        `;

        // Wrap field in relative container
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        field.parentNode.insertBefore(wrapper, field);
        wrapper.appendChild(field);
        wrapper.appendChild(toggleBtn);

        toggleBtn.addEventListener('click', () => {
            const isPassword = field.type === 'password';
            field.type = isPassword ? 'text' : 'password';
            toggleBtn.textContent = isPassword ? '🙈' : '👁️';
        });
    }

    async loadSettings() {
        try {
            const syncSettings = await chrome.storage.sync.get([
                'systemPrompt',
                'customQuickActions',
                'selectedModel'
            ]);
            
            const localSettings = await chrome.storage.local.get(['novaApiKey']);
            const settings = { ...syncSettings, ...localSettings };

            // Load Nova API key from local storage
            if (settings.novaApiKey) {
                this.elements.novaApiKey.value = settings.novaApiKey;
            }
            
            // Load selected model
            if (settings.selectedModel) {
                this.elements.selectedModel.value = settings.selectedModel;
            }
            
            // Load system prompt
            if (settings.systemPrompt) {
                this.elements.systemPrompt.value = settings.systemPrompt;
            }
            
            // Load custom quick actions - if none exist, save defaults
            let quickActions = settings.customQuickActions;
            if (!quickActions || quickActions.length === 0) {
                quickActions = this.getDefaultQuickActions();
                // Save defaults so they persist
                await chrome.storage.sync.set({ customQuickActions: quickActions });
            }
            this.loadQuickActions(quickActions);

            this.showStatus('Settings loaded successfully', 'success');
        } catch (error) {
            this.showStatus('Failed to load settings: ' + error.message, 'error');
        }
    }

    async saveSettings() {
        try {
            // Validate required fields
            const apiKey = this.elements.novaApiKey.value.trim();

            if (!apiKey) {
                this.showStatus('Please enter your Nova API key', 'error');
                return;
            }

            const syncSettings = {
                systemPrompt: this.elements.systemPrompt.value,
                customQuickActions: this.getCurrentQuickActions(),
                selectedModel: this.elements.selectedModel.value
            };

            // Show saving state
            this.elements.saveSettings.disabled = true;
            this.elements.saveSettings.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

            // Store API key in local storage (more secure)
            await chrome.storage.local.set({ novaApiKey: apiKey });
            
            // Store other settings in sync storage
            await chrome.storage.sync.set(syncSettings);
            
            this.showStatus('Settings saved successfully!', 'success');
            
            // Reset button
            setTimeout(() => {
                this.elements.saveSettings.disabled = false;
                this.elements.saveSettings.innerHTML = '<i class="fas fa-save"></i> Save Settings';
            }, 1000);

        } catch (error) {
            this.showStatus('Failed to save settings: ' + error.message, 'error');
            this.elements.saveSettings.disabled = false;
            this.elements.saveSettings.innerHTML = '<i class="fas fa-save"></i> Save Settings';
        }
    }


    async testConnection() {
        try {
            // Disable button and show loading state
            this.elements.testConnection.disabled = true;
            this.elements.testConnection.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';

            // Get current settings
            const apiKey = this.elements.novaApiKey.value.trim();

            if (!apiKey) {
                throw new Error('Please enter your Nova API key before testing');
            }

            // Test connection by trying to make a simple API call
            const testResult = await this.performConnectionTest(apiKey);
            
            if (testResult.success) {
                this.showStatus('✓ Connection successful! Your Nova API key is working.', 'success');
            } else {
                this.showStatus('✗ Connection failed: ' + testResult.error, 'error');
            }

        } catch (error) {
            this.showStatus('✗ Connection test failed: ' + error.message, 'error');
        } finally {
            // Reset button
            this.elements.testConnection.disabled = false;
            this.elements.testConnection.innerHTML = '<i class="fas fa-plug"></i> Test Connection';
        }
    }

    async performConnectionTest(apiKey) {
        try {
            // Send test request to background script
            return new Promise((resolve) => {
                chrome.runtime.sendMessage({
                    action: 'testConnection',
                    credentials: { apiKey }
                }, (response) => {
                    resolve(response || { success: false, error: 'No response from background script' });
                });
            });
        } catch (error) {
            return { success: false, error: error.message };
        }
    }


    showStatus(message, type = 'info') {
        const statusElement = this.elements.statusMessage;
        statusElement.textContent = message;
        statusElement.className = `status-message ${type}`;
        statusElement.style.display = 'block';

        // Auto-hide after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                statusElement.style.display = 'none';
            }, 5000);
        }
    }

    // Utility method to export/import settings
    exportSettings() {
        chrome.storage.sync.get(null, (settings) => {
            // Remove any sensitive data from export (API key is already in local storage)
            const exportData = { ...settings };
            // Ensure no API key in export
            delete exportData.novaApiKey;
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'nova-ai-settings.json';
            a.click();
            
            URL.revokeObjectURL(url);
        });
    }
    
    // Quick Actions Management
    getDefaultQuickActions() {
        return [
            { label: 'Summarize', prompt: 'Please summarize the main points of this page.' },
            { label: 'Explain', prompt: 'Explain this content in simple terms.' },
            { label: 'Key Points', prompt: 'Extract the key points from this page.' },
            { label: 'Translate', prompt: 'Translate this content to Spanish.' }
        ];
    }
    
    loadQuickActions(actions) {
        this.elements.quickActionsList.innerHTML = '';
        actions.forEach((action, index) => {
            this.addQuickActionElement(action, index);
        });
    }
    
    addQuickActionElement(action, index) {
        const actionDiv = document.createElement('div');
        actionDiv.className = 'quick-action-item';
        actionDiv.dataset.index = index;
        
        actionDiv.innerHTML = `
            <div class="quick-action-header">
                <input type="text" class="quick-action-label" value="${action.label}" placeholder="Action Label">
                <button class="quick-action-delete" data-index="${index}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
            <textarea class="quick-action-prompt" placeholder="Enter the prompt for this action">${action.prompt}</textarea>
        `;
        
        // Add event listeners
        const deleteBtn = actionDiv.querySelector('.quick-action-delete');
        deleteBtn.addEventListener('click', () => this.deleteQuickAction(index));
        
        const labelInput = actionDiv.querySelector('.quick-action-label');
        const promptTextarea = actionDiv.querySelector('.quick-action-prompt');
        
        labelInput.addEventListener('input', () => this.saveQuickActions());
        promptTextarea.addEventListener('input', () => this.saveQuickActions());
        
        this.elements.quickActionsList.appendChild(actionDiv);
    }
    
    addQuickAction() {
        const newAction = { label: 'New Action', prompt: 'Enter your custom prompt here' };
        const currentActions = this.getCurrentQuickActions();
        currentActions.push(newAction);
        this.loadQuickActions(currentActions);
        this.saveQuickActions();
    }
    
    deleteQuickAction(index) {
        const currentActions = this.getCurrentQuickActions();
        currentActions.splice(index, 1);
        this.loadQuickActions(currentActions);
        this.saveQuickActions();
        this.showStatus('Quick action deleted', 'success');
    }
    
    getCurrentQuickActions() {
        const actions = [];
        document.querySelectorAll('.quick-action-item').forEach(item => {
            const label = item.querySelector('.quick-action-label').value.trim();
            const prompt = item.querySelector('.quick-action-prompt').value.trim();
            if (label && prompt) {
                actions.push({ label, prompt });
            }
        });
        return actions;
    }
    
    async saveQuickActions() {
        try {
            const actions = this.getCurrentQuickActions();
            await chrome.storage.sync.set({ customQuickActions: actions });
        } catch (error) {
            console.error('Failed to save quick actions:', error);
        }
    }
    
    async autoSaveSystemPrompt() {
        try {
            const systemPrompt = this.elements.systemPrompt.value;
            await chrome.storage.sync.set({ systemPrompt });
        } catch (error) {
            console.error('Failed to save system prompt:', error);
        }
    }
}

// Connection test is now handled by the background script

// Initialize settings manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SettingsManager();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 's':
                e.preventDefault();
                document.getElementById('saveSettings').click();
                break;
            case 't':
                e.preventDefault();
                document.getElementById('testConnection').click();
                break;
        }
    }
});
