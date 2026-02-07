# Contributing to Nova AI Assistant

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
   ```bash
   git clone https://github.com/yourusername/nova-chrome-extension.git
   cd nova-chrome-extension/HypExtension
   ```
3. **Create a branch** for your feature
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 💻 Development Setup

1. Load the extension in Chrome:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `HypExtension` folder

2. Make your changes to the code

3. Test your changes:
   - Reload the extension in `chrome://extensions/`
   - Test all affected functionality
   - Check browser console for errors

## 📝 Code Style

- Use **2 spaces** for indentation
- Use **camelCase** for variables and functions
- Use **PascalCase** for classes
- Add **comments** for complex logic
- Keep functions **small and focused**
- Use **async/await** instead of promises where possible

### Example:
```javascript
// Good
async function fetchData(apiKey) {
  try {
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    return await response.json();
  } catch (error) {
    console.error('Fetch failed:', error);
    throw error;
  }
}

// Avoid
function fetchData(apiKey) {
  return fetch(url).then(r => r.json()).catch(e => console.log(e));
}
```

## 🧪 Testing

Before submitting a PR, please test:

- [ ] Extension loads without errors
- [ ] All existing features still work
- [ ] New features work as expected
- [ ] No console errors or warnings
- [ ] Works in both light and dark mode
- [ ] Responsive design works on different screen sizes

## 📋 Pull Request Process

1. **Update documentation** if needed (README, comments, etc.)
2. **Test thoroughly** on your local machine
3. **Commit with clear messages**:
   ```bash
   git commit -m "Add feature: brief description"
   ```
4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Create a Pull Request** on GitHub with:
   - Clear title describing the change
   - Description of what changed and why
   - Screenshots/GIFs if UI changed
   - Reference any related issues

## 🐛 Bug Reports

When reporting bugs, please include:

- **Chrome version** (`chrome://version/`)
- **Extension version** (from manifest.json)
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Console errors** (if any)
- **Screenshots** (if applicable)

## 💡 Feature Requests

For feature requests, please:

- Check if the feature already exists
- Explain the use case and benefit
- Provide examples or mockups if possible
- Be open to discussion and feedback

## 🎯 Areas for Contribution

We welcome contributions in these areas:

### High Priority
- [ ] Streaming responses support
- [ ] Better token counting
- [ ] Image analysis (multimodal)
- [ ] Conversation export/import
- [ ] Usage statistics/tracking

### Medium Priority
- [ ] Keyboard shortcuts
- [ ] Custom themes
- [ ] Multiple API key profiles
- [ ] Conversation search
- [ ] Response formatting options

### Low Priority
- [ ] Offline mode with cached responses
- [ ] Browser sync for settings
- [ ] Voice input support
- [ ] Translation improvements
- [ ] Accessibility enhancements

## 📚 Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Amazon Nova API Documentation](https://nova.amazon.com/dev/documentation)

## ❓ Questions?

Feel free to:
- Open an issue for discussion
- Ask in pull request comments
- Check existing issues and PRs

## 📜 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

Thank you for contributing! 🎉
