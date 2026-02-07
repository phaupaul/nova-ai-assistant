# Security Policy

## Security Audit Summary

This extension has undergone a comprehensive security audit. Last audit: February 7, 2026

### Security Features

✅ **API Key Protection**
- API keys stored in local storage (not synced)
- Transmitted only via HTTPS to official Nova API
- Never logged or exposed in code

✅ **XSS Prevention**
- All user input sanitized using `escapeHtml()`
- Markdown rendering properly escapes HTML
- No use of `eval()` or unsafe code execution

✅ **Content Security Policy**
- Strict CSP implemented
- Scripts limited to extension files only
- External resources limited to trusted CDNs

✅ **Minimal Permissions**
- Only essential Chrome permissions requested
- Host permissions limited to Nova API endpoint
- No unnecessary data access

✅ **Data Privacy**
- No data sent to third-party services
- Conversation history stored locally only
- Page content truncated to prevent excessive storage

## Reporting Security Issues

If you discover a security vulnerability, please report it by:

1. **DO NOT** open a public GitHub issue
2. Email the maintainer directly (check GitHub profile)
3. Include detailed steps to reproduce
4. Allow reasonable time for a fix before public disclosure

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Best Practices for Users

1. **Protect Your API Key**
   - Never share your Nova API key
   - Rotate keys regularly
   - Use keys with minimal required permissions

2. **Review Permissions**
   - Understand what permissions the extension requests
   - Only grant necessary permissions

3. **Keep Updated**
   - Install updates promptly
   - Check changelog for security fixes

4. **Be Cautious with Sensitive Content**
   - Avoid sending sensitive personal information
   - Remember that content is sent to Amazon Nova API

## Third-Party Dependencies

This extension uses:
- Font Awesome (via CDN) - for icons only
- Chrome Extension APIs - official Google APIs

No other third-party libraries or tracking services are used.
