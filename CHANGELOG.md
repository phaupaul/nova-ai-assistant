# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-02-07

### Added
- Initial release of Nova AI Assistant Chrome Extension
- Integration with Amazon Nova API (OpenAI-compatible endpoint)
- Side panel interface for seamless chat experience
- Support for multiple Nova models (Lite, Pro, Ultra)
- Optional page context selection (single or multiple tabs)
- Customizable quick actions for common tasks
- System prompt customization
- Dark mode support
- Secure API key storage in Chrome local storage
- Connection testing functionality
- Markdown formatting in AI responses
- Conversation history (last 3 exchanges for context)
- Content extraction from webpages
- Error handling with helpful messages

### Features
- **Models Supported:**
  - Nova 2 Lite (fast & cost-effective)
  - Nova 2 Pro (most intelligent)

- **Quick Actions:**
  - Summarize page content
  - Explain in simple terms
  - Translate content
  - Extract key points

- **Chat History** - Save and resume conversations with timestamps
- **Collapsible Sidebar** - Access past conversations without cluttering the main view
- **Clean Interface** - Minimalist design focused on the conversation
- **Smart Context** - Collapsible page context panel that stays out of the way

### Technical Details
- Built with Manifest V3
- Uses Chrome Side Panel API
- OpenAI-compatible API format
- Vanilla JavaScript (no frameworks)
- CSS Grid/Flexbox layouts
- Font Awesome icons

### Security
- API keys stored in Chrome's encrypted local storage
- HTTPS-only communication
- No third-party data collection
- Minimal required permissions

---

## Future Releases

### Planned for v1.1.0
- [ ] Streaming responses
- [ ] Better token counting
- [ ] Conversation export/import
- [ ] Usage statistics

### Planned for v1.2.0
- [ ] Image analysis support
- [ ] Voice input
- [ ] Keyboard shortcuts
- [ ] Custom themes

### Planned for v2.0.0
- [ ] Multi-provider support (OpenAI, Anthropic, etc.)
- [ ] Advanced context management
- [ ] Plugin system
- [ ] Team collaboration features
