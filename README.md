# Nova AI Assistant - Chrome Extension

A powerful Chrome extension that brings Amazon Nova AI models directly to your browser. Analyze webpages, ask questions, and interact with AI without leaving your current tab.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Chrome](https://img.shields.io/badge/chrome-extension-orange)
![Security](https://img.shields.io/badge/security-audited-success)

## ✨ Features

- **🤖 AI-Powered Chat** - Interact with Amazon Nova models directly in your browser
- **� Chat History** - Save and resume conversations anytime
- **�📄 Page Context** - Optionally include webpage content for context-aware responses
- **⚡ Quick Actions** - Pre-configured prompts for common tasks (summarize, explain, translate)
- **🎨 Clean UI** - Modern, minimalist design with collapsible sidebar
- **🌙 Dark Mode** - Automatic dark mode support
- **🔒 Secure** - API keys stored securely in Chrome's local storage
- **🎯 Multi-Tab Support** - Analyze multiple pages simultaneously
- **⚙️ Customizable** - Create your own quick actions and system prompts

## 🚀 Installation

### From Source

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nova-chrome-extension.git
   cd nova-chrome-extension/HypExtension
   ```

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `HypExtension` folder

3. **Configure API Key**
   - Click the extension icon in your toolbar
   - Click the settings icon (⚙️)
   - Enter your Nova API key
   - Select your preferred model
   - Click "Test Connection" to verify
   - Click "Save Settings"

## 🔑 Getting Your Nova API Key

1. Visit [Amazon Nova Developer Portal](https://nova.amazon.com/dev/documentation)
2. Sign up or log in to your account
3. Generate an API key
4. Copy the key and paste it into the extension settings

## 📖 Usage

### Basic Chat

1. Click the extension icon to open the side panel
2. Type your question in the input field
3. Press Enter or click the send button
4. Receive AI-powered responses instantly

### Chat History

1. Click the menu icon (☰) to open the conversation sidebar
2. View all your past conversations
3. Click any conversation to resume it
4. Hover over a conversation and click the trash icon to delete it
5. Click "New Chat" to start fresh

### With Page Context

1. Open the side panel
2. Click "Page Context" to expand the context panel
3. Check "Current Page" to include the current page's content
4. Expand "Other Tabs" to include content from multiple pages
5. Ask questions about the selected pages

### Quick Actions

Use pre-configured prompts for common tasks:
- **Summarize** - Get a concise summary of the page
- **Explain** - Get a simple explanation of complex content
- **Translate** - Translate content to another language
- **Key Points** - Extract main points from the page

### Custom Quick Actions

1. Open Settings (⚙️ icon)
2. Scroll to "Custom Quick Actions"
3. Click "Add Quick Action"
4. Enter a label and custom prompt
5. Save settings
6. Your custom action will appear in the side panel

## 🎛️ Configuration

### Available Models

- **Nova 2 Lite** - Fast and cost-effective for everyday tasks
- **Nova 2 Pro** - Most intelligent for complex reasoning and analysis

### System Prompt

Customize the AI's behavior by setting a system prompt in settings:
```
Example: You are a helpful assistant that provides concise, 
accurate answers. Always cite sources when possible.
```

## 🛠️ Development

### Project Structure

```
HypExtension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (API calls)
├── content.js            # Content script (page extraction)
├── sidepanel.html/js/css # Main chat interface
├── popup.html/js/css     # Popup interface
├── options.html/js/css   # Settings page
└── icons/                # Extension icons
```

### Key Technologies

- **Manifest V3** - Latest Chrome extension standard
- **Chrome Side Panel API** - Native browser integration
- **OpenAI-Compatible API** - Standard chat completions format
- **Vanilla JavaScript** - No framework dependencies
- **CSS Grid/Flexbox** - Modern responsive layouts

### API Integration

The extension uses Amazon Nova's OpenAI-compatible endpoint:

```javascript
POST https://api.nova.amazon.com/v1/chat/completions
Headers:
  Content-Type: application/json
  Authorization: Bearer YOUR_API_KEY
Body:
  {
    "model": "nova-2-lite-v1",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello!"}
    ]
  }
```

## 🔒 Privacy & Security

- **Local Storage** - API keys stored securely in Chrome's encrypted local storage
- **No Data Collection** - No user data is collected or transmitted to third parties
- **HTTPS Only** - All API communications use secure HTTPS
- **Minimal Permissions** - Only requests necessary Chrome permissions

## 🐛 Troubleshooting

### Extension Won't Load
- Ensure you're using Chrome (not Chromium or other browsers)
- Check that all files are present in the folder
- Look for errors in `chrome://extensions/` with Developer mode enabled

### API Connection Failed
- Verify your API key is correct
- Check your internet connection
- Ensure you have API credits/quota available
- Try the "Test Connection" button in settings

### Page Content Not Extracting
- Some pages (like `chrome://` URLs) cannot be accessed
- JavaScript-heavy sites may need a moment to load
- Try refreshing the page and reopening the side panel

### Dark Mode Issues
- Clear browser cache
- Reload the extension
- Check your system's dark mode settings

## 📝 License

MIT License - feel free to use, modify, and distribute as needed.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Amazon Nova for providing the AI models
- Chrome Extensions team for the excellent APIs
- Font Awesome for the icons

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check the [Troubleshooting Guide](TROUBLESHOOTING.md)

---

**Note:** This extension requires an Amazon Nova API key. API usage may incur costs based on your Nova plan.
