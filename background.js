// Nova API service using OpenAI-compatible endpoint

class NovaAPIService {
    constructor() {
        this.apiKey = null;
        this.apiEndpoint = 'https://api.nova.amazon.com';
    }

    async initialize() {
        try {
            const localSettings = await chrome.storage.local.get(['novaApiKey']);
            
            if (localSettings.novaApiKey) {
                this.apiKey = localSettings.novaApiKey;
                console.log('Nova API service initialized with API key');
                return true;
            } else {
                console.log('Nova API service initialized without API key - it can be configured later');
                return false;
            }
        } catch (error) {
            console.error('Failed to initialize Nova API service:', error);
            return false;
        }
    }
    
    async getSystemPrompt() {
        try {
            const result = await chrome.storage.sync.get(['systemPrompt']);
            const customPrompt = result.systemPrompt || '';
            const defaultPrompt = "You are Nova, a helpful AI assistant. You provide friendly, informative, and accurate responses to any questions. Be conversational, helpful, and concise.";
            
            // Combine custom and default prompts if custom exists
            const fullPrompt = customPrompt ? `${customPrompt}\n\n${defaultPrompt}` : defaultPrompt;
            
            return fullPrompt;
        } catch (error) {
            console.error('Failed to get system prompt:', error);
            return "You are Nova, a helpful AI assistant. You provide friendly, informative, and accurate responses to any questions. Be conversational, helpful, and concise.";
        }
    }

    async callNova(userMessage, pageContent, multimodal = false, conversationHistory = []) {
        try {
            if (!this.apiKey) {
                await this.initialize();
            }

            // Get selected model from settings
            const settings = await chrome.storage.sync.get(['selectedModel']);
            const modelId = settings.selectedModel || 'nova-2-lite-v1'; // Default to Nova 2 Lite

            // Prepare messages in OpenAI format
            const messages = [];
            
            // Add system prompt
            const systemPrompt = await this.getSystemPrompt();
            messages.push({
                role: 'system',
                content: systemPrompt
            });
            
            // Add conversation history for context (only complete exchanges)
            conversationHistory.slice(-3).forEach(exchange => {
                // Only add if both user and AI messages exist and are not empty
                if (exchange.user && exchange.user.trim() && exchange.ai && exchange.ai.trim()) {
                    messages.push({
                        role: 'user',
                        content: exchange.user
                    });
                    messages.push({
                        role: 'assistant',
                        content: exchange.ai
                    });
                }
            });

            // Build the current user message with context
            const contextPrompt = this.buildContextPrompt(userMessage, pageContent, multimodal);
            messages.push({
                role: 'user',
                content: contextPrompt
            });

            const payload = {
                model: modelId,
                messages: messages,
                temperature: 0.7,
                max_tokens: multimodal ? 2048 : 1024
            };

            const response = await this.makeNovaRequest(payload);
            
            if (response.choices && response.choices[0] && response.choices[0].message) {
                return response.choices[0].message.content;
            } else {
                throw new Error('Unexpected response format from Nova API');
            }

        } catch (error) {
            console.error('Nova API call failed:', error);
            throw new Error(`Nova API error: ${error.message}`);
        }
    }

    buildContextPrompt(userMessage, pageContent, multimodal) {
        // Check if page content is provided
        if (pageContent && pageContent.text) {
            // Include page context when available
            let prompt = '';
            
            // Handle multiple pages (when title/url contains " | ")
            const isMultiplePages = pageContent.title && pageContent.title.includes(' | ');
            
            if (isMultiplePages) {
                prompt += `Multiple Pages Context:\n\n`;
            } else {
                if (pageContent.title) {
                    prompt += `Page Title: ${pageContent.title}\n\n`;
                }
                
                if (pageContent.url) {
                    prompt += `Page URL: ${pageContent.url}\n\n`;
                }
            }
            
            if (pageContent.text) {
                const maxContentLength = 8000; // Increased for multiple pages
                const truncatedText = pageContent.text.length > maxContentLength 
                    ? pageContent.text.substring(0, maxContentLength) + '...[content truncated]'
                    : pageContent.text;
                
                prompt += `${isMultiplePages ? 'Combined ' : ''}Page Content:\n${truncatedText}\n\n`;
            }
            
            prompt += `User Question: ${userMessage}`;
            return prompt;
        } else {
            // No page context - just return the user message
            return userMessage;
        }
    }

    async makeNovaRequest(payload) {
        if (!this.apiKey) {
            throw new Error('Nova API key not configured. Please set up your API key in extension settings.');
        }

        try {
            const url = `${this.apiEndpoint}/v1/chat/completions`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey.trim()}`
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Nova API Error:', response.status, errorText);
                
                if (response.status === 401) {
                    throw new Error('Invalid API key. Please check your Nova API key in settings.');
                } else if (response.status === 403) {
                    throw new Error('Access denied. Please verify your Nova API key has the correct permissions.');
                } else if (response.status === 404) {
                    throw new Error('Nova API endpoint not found. Please check your configuration.');
                } else if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please wait a moment and try again.');
                } else {
                    throw new Error(`API Error (${response.status}): ${errorText}`);
                }
            }

            return await response.json();
            
        } catch (error) {
            console.error('Nova request failed:', error);
            throw error;
        }
    }

}

// Initialize service
const novaService = new NovaAPIService();

// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'callNova') {
        handleNovaRequest(request.data)
            .then(result => sendResponse({ success: true, data: result }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'testConnection') {
        handleConnectionTest(request.credentials)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'openOptions') {
        chrome.runtime.openOptionsPage();
        return true;
    }
    
    if (request.action === 'getTabs') {
        chrome.tabs.query({}, (tabs) => {
            sendResponse(tabs);
        });
        return true;
    }
    
    if (request.action === 'getTabContent') {
        getTabContent(request.tabId)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }
});

async function handleConnectionTest(credentials) {
    try {
        console.log('Testing Nova API connection');
        
        // Basic validation
        if (!credentials.apiKey) {
            throw new Error('Missing Nova API key');
        }
        
        // Try a simple API call to test the connection
        const testUrl = 'https://api.nova.amazon.com/v1/chat/completions';
        
        const testPayload = {
            model: 'nova-2-lite-v1',
            messages: [
                {
                    role: 'user',
                    content: 'Hello'
                }
            ],
            max_tokens: 50,
            temperature: 0.1
        };
        
        const response = await fetch(testUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${credentials.apiKey.trim()}`
            },
            body: JSON.stringify(testPayload)
        });
        
        if (response.ok) {
            return { 
                success: true, 
                message: 'Connection test successful! Your Nova API key is working.' 
            };
        } else {
            const errorText = await response.text();
            if (response.status === 401) {
                throw new Error('Invalid API key');
            } else if (response.status === 403) {
                throw new Error('Access denied - check API key permissions');
            } else {
                throw new Error(`API Error (${response.status}): ${errorText}`);
            }
        }
    } catch (error) {
        return { 
            success: false, 
            error: 'Connection test failed: ' + error.message 
        };
    }
}

async function getTabContent(tabId) {
    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                // Extract content from the target tab
                try {
                    const title = document.title;
                    const url = window.location.href;
                    
                    // Remove unwanted elements
                    const elementsToRemove = [
                        'script', 'style', 'nav', 'header', 'footer', 
                        '.advertisement', '.ad', '.sidebar', '.menu'
                    ];
                    
                    const clone = document.cloneNode(true);
                    elementsToRemove.forEach(selector => {
                        const elements = clone.querySelectorAll(selector);
                        elements.forEach(el => el.remove());
                    });
                    
                    // Get main content
                    const mainSelectors = [
                        'main', 'article', '[role="main"]', '.content', '.main-content'
                    ];
                    
                    let mainContent = null;
                    for (const selector of mainSelectors) {
                        mainContent = clone.querySelector(selector);
                        if (mainContent) break;
                    }
                    
                    if (!mainContent) {
                        mainContent = clone.body || clone.documentElement;
                    }
                    
                    let text = mainContent.innerText || mainContent.textContent || '';
                    text = text.replace(/\s+/g, ' ').trim();
                    
                    // Limit content length
                    const maxLength = 8000;
                    if (text.length > maxLength) {
                        text = text.substring(0, maxLength) + '...[content truncated]';
                    }
                    
                    return {
                        title: title,
                        url: url,
                        text: text
                    };
                } catch (error) {
                    return { error: error.message };
                }
            }
        });
        
        if (results && results[0] && results[0].result) {
            if (results[0].result.error) {
                throw new Error(results[0].result.error);
            }
            return { success: true, data: results[0].result };
        } else {
            throw new Error('Failed to extract content from tab');
        }
    } catch (error) {
        console.error('Error extracting tab content:', error);
        return { success: false, error: error.message };
    }
}

async function handleNovaRequest(data) {
    try {
        const { userMessage, pageContent, multimodal, conversationHistory } = data;
        
        const response = await novaService.callNova(
            userMessage,
            pageContent,
            multimodal,
            conversationHistory
        );

        return response;
    } catch (error) {
        console.error('Error handling Nova request:', error);
        throw error;
    }
}

// Check if API key is configured
async function checkCredentials() {
    try {
        const localStorage = await chrome.storage.local.get(['novaApiKey']);
        
        if (!localStorage.novaApiKey) {
            console.log('Nova API key not configured - user needs to set up API key in settings');
        } else {
            console.log('Nova API key found - extension ready to use');
        }
    } catch (error) {
        console.error('Credential check failed:', error);
    }
}

// Initialize on startup
chrome.runtime.onStartup.addListener(() => {
    novaService.initialize();
});

chrome.runtime.onInstalled.addListener(async (details) => {
    // Check credentials on install or update
    await checkCredentials();
    novaService.initialize();
});

// Handle extension icon click - Open the side panel
chrome.action.onClicked.addListener((tab) => {
    // Open the side panel
    chrome.sidePanel.open({ windowId: tab.windowId }).catch((error) => {
        console.error('Failed to open side panel:', error);
    });
});

// Handle tab updates to ensure content script is available
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
        // Inject content script if needed
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        }).catch(() => {
            // Ignore errors for restricted pages
        });
    }
});
