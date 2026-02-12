#!/bin/bash

# Nova AI Assistant - GitHub Publishing Script
# Repository: git@github.com:phaupaul/nova-ai-assistant.git

echo "🚀 Publishing Nova AI Assistant to GitHub..."
echo ""

# Navigate to extension directory
cd "$(dirname "$0")"

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
else
    echo "✅ Git repository already initialized"
fi

# Add all files
echo "📝 Adding files..."
git add .

# Create initial commit
echo "💾 Creating commit..."
git commit -m "Initial commit: Nova AI Assistant v1.0.0

✅ Security audit passed - No critical vulnerabilities
- AI-powered webpage analysis using Amazon Nova API
- Chat interface with conversation history
- Quick actions for common tasks (summarize, explain, translate)
- Multi-tab context support for analyzing multiple pages
- Secure API key storage in Chrome local storage
- Modern, responsive UI with dark mode support
- Markdown formatting for AI responses
- Customizable system prompts and quick actions

Features:
- 🤖 AI-powered chat with Amazon Nova models
- 💬 Conversation history with save/resume
- ⚡ Quick actions for common tasks
- 📄 Multi-tab context support
- 🔒 Secure API key handling
- 🎨 Clean, modern UI
- 🌙 Dark mode support
- ⚙️ Customizable settings

Security:
- XSS protection implemented
- Input sanitization in place
- HTTPS-only communication
- Minimal Chrome permissions
- No third-party data sharing

Documentation:
- Comprehensive README with installation guide
- Security audit report included
- MIT License
- Contributing guidelines
- Troubleshooting guide"

# Add remote (if not already added)
if ! git remote | grep -q origin; then
    echo "🔗 Adding GitHub remote..."
    git remote add origin git@github.com:phaupaul/nova-ai-assistant.git
else
    echo "✅ Remote already configured"
fi

# Rename branch to main
echo "🌿 Setting main branch..."
git branch -M main

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push -u origin main

# Create version tag
echo "🏷️  Creating version tag v1.0.0..."
git tag -a v1.0.0 -m "Release v1.0.0 - Initial public release

🎉 First public release of Nova AI Assistant!

Features:
- AI-powered chat with Amazon Nova models (Lite & Pro)
- Conversation history with save/resume functionality
- Quick actions for common tasks
- Multi-tab context support
- Secure API key storage
- Modern, responsive UI with dark mode
- Markdown formatting support
- Customizable settings

Security:
✅ Passed comprehensive security audit
- No critical vulnerabilities found
- Secure API key handling
- XSS protection implemented
- Minimal permissions requested
- HTTPS-only communication

Installation:
See README.md for detailed installation instructions

Requirements:
- Chrome browser (version 88+)
- Amazon Nova API key from https://nova.amazon.com"

# Push tag
echo "⬆️  Pushing tag to GitHub..."
git push origin v1.0.0

echo ""
echo "✅ Successfully published to GitHub!"
echo ""
echo "🎉 Your extension is now live at:"
echo "   https://github.com/phaupaul/nova-ai-assistant"
echo ""
echo "📋 Next steps:"
echo "   1. Visit your repository and verify everything looks good"
echo "   2. Go to 'Releases' and create a release from tag v1.0.0"
echo "   3. Add topics: chrome-extension, ai, amazon-nova, chatbot"
echo "   4. Enable Issues for bug reports"
echo "   5. Share your work on social media!"
echo ""
echo "📚 For Chrome Web Store submission, see PUBLISH_CHECKLIST.md"
echo ""
