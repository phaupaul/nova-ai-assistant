# 🚀 Quick Start Guide

Get up and running with Nova AI Assistant in 5 minutes!

## Prerequisites

- Google Chrome browser
- Amazon Nova API key ([Get one here](https://nova.amazon.com/dev/documentation))

## Installation (3 steps)

### 1. Download the Extension

**Option A: Clone from GitHub**
```bash
git clone https://github.com/yourusername/nova-chrome-extension.git
cd nova-chrome-extension/HypExtension
```

**Option B: Download ZIP**
- Download the repository as ZIP
- Extract to a folder on your computer

### 2. Load in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Toggle "Developer mode" ON (top-right corner)
3. Click "Load unpacked"
4. Select the `HypExtension` folder
5. The extension icon should appear in your toolbar

### 3. Configure API Key

1. Click the extension icon in your toolbar
2. Click the settings icon (⚙️) in the top-right
3. Enter your Nova API key
4. Select your preferred model (Nova 2 Lite recommended for testing)
5. Click "Test Connection" to verify
6. Click "Save Settings"

## First Use (30 seconds)

### Basic Chat
1. Click the extension icon to open the side panel
2. Type "Hello!" in the input field
3. Press Enter
4. Get your first AI response!

### With Page Context
1. Open any webpage (e.g., a news article)
2. Click the extension icon
3. Check the "Current Page" checkbox
4. Ask: "Summarize this page"
5. Get an AI summary of the page content

### Quick Actions
1. Open the side panel
2. Click any quick action button:
   - **Summarize** - Get a page summary
   - **Explain** - Simplify complex content
   - **Translate** - Translate to another language
   - **Key Points** - Extract main points

## Tips for Best Results

### 💡 Pro Tips
- **Use page context** for questions about specific webpages
- **Uncheck context** for general questions
- **Select multiple tabs** to compare or analyze multiple pages
- **Create custom quick actions** for your frequent tasks
- **Set a system prompt** to customize AI behavior

### ⚡ Performance Tips
- **Nova 2 Lite** - Fastest and most cost-effective, best for quick questions and everyday tasks
- **Nova 2 Pro** - Most intelligent, best for complex reasoning and analysis

### 🎯 Example Prompts

**Without Page Context:**
- "Explain quantum computing in simple terms"
- "Write a professional email about..."
- "What are the best practices for..."

**With Page Context:**
- "Summarize the main points of this article"
- "What are the key takeaways?"
- "Translate this to Spanish"
- "Explain this in simpler terms"

**Multiple Pages:**
- "Compare these two articles"
- "What are the common themes across these pages?"
- "Summarize all these tabs"

## Customization

### Create Custom Quick Actions
1. Open Settings (⚙️)
2. Scroll to "Custom Quick Actions"
3. Click "Add Quick Action"
4. Enter:
   - **Label:** "Code Review"
   - **Prompt:** "Review this code and suggest improvements"
5. Save settings
6. Your custom action appears in the side panel!

### Set System Prompt
1. Open Settings
2. Find "System Prompt" section
3. Enter your custom prompt:
   ```
   You are a helpful coding assistant. Always provide 
   code examples and explain technical concepts clearly.
   ```
4. Save settings
5. All future conversations use this context!

## Troubleshooting

### Extension Won't Load
- Make sure you're in `chrome://extensions/`
- Developer mode must be ON
- Select the correct folder (HypExtension)

### API Connection Failed
- Check your API key is correct
- Verify you have API credits
- Try "Test Connection" in settings
- Check your internet connection

### Page Content Not Working
- Refresh the page
- Some pages (like chrome://) can't be accessed
- Try a different website

### Need More Help?
- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Open an issue on GitHub
- Review the full [README.md](README.md)

## What's Next?

- ⭐ Star the repository on GitHub
- 🐛 Report bugs or request features
- 🤝 Contribute improvements
- 📢 Share with others!

---

**Enjoy using Nova AI Assistant!** 🎉

For detailed documentation, see [README.md](README.md)
