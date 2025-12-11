# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.3.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** open a public issue
2. Email the maintainers directly or use GitHub's private vulnerability reporting
3. Include detailed information about the vulnerability
4. Allow reasonable time for a fix before public disclosure

### What to Include

- Type of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Security Best Practices

### API Key Management

- **Never** commit API keys to the repository
- Use `.env.local` for local development (already in `.gitignore`)
- Use environment variables in production
- Rotate keys if accidentally exposed

### For Users

1. Keep your Gemini API key secure
2. Use a dedicated API key for this application
3. Monitor API usage for unexpected activity
4. Use the paid tier with billing alerts enabled

### For Contributors

1. Never log sensitive information
2. Validate all user inputs
3. Use HTTPS for all external requests
4. Keep dependencies updated
5. Review security implications of changes

## Known Security Considerations

### LocalStorage Usage

- Generated images are stored as base64 in localStorage
- localStorage is accessible to JavaScript on the same origin
- Clear browser data to remove stored images
- Do not store sensitive content in generated infographics

### API Communication

- All API calls use HTTPS
- API keys are injected at build time, not exposed to client
- Rate limiting is handled gracefully

## Security Updates

Security patches will be released as soon as possible after a vulnerability is confirmed. Watch this repository for updates.

## Contact

For security concerns, contact the maintainers through GitHub.
