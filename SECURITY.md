# Security Policy

## Security Model Overview

InfoGraphix AI is a **client-side web application** designed for deployment in [Google AI Studio](https://ai.google.dev/). This architecture choice has important security implications that are intentional by design.

### Architecture

```
User's Browser
    ├── React Application (InfoGraphix AI)
    │   ├── User Interface
    │   ├── API Key (client-side storage)
    │   └── LocalStorage (versions, templates, batches)
    └── Direct API Calls
        └── Google Gemini APIs
```

**Key Points:**
- All processing happens in the user's browser
- No backend server or database
- Direct API communication with Google Gemini
- API keys are handled client-side (intentional for AI Studio deployment)

---

## API Key Security

### Design Choice: Client-Side API Keys

InfoGraphix AI uses **client-side API key handling** by design. This is intentional for the following reasons:

1. **Google AI Studio Integration**
   - The application is designed to run within Google AI Studio
   - AI Studio provides secure API key selection via `window.aistudio` interface
   - Keys are managed by Google's infrastructure, not the application

2. **No Server Infrastructure**
   - Zero server-side code means zero server-side vulnerabilities
   - No database to compromise
   - No backend API to attack
   - Reduced attack surface

3. **User Control**
   - Users maintain complete control over their API keys
   - Direct API communication (no intermediary)
   - Transparent usage and billing

### Local Development

For local development outside AI Studio:

```bash
# .env.local (gitignored)
GEMINI_API_KEY=your_api_key_here
```

**Important:** `.env.local` is automatically gitignored and should **never** be committed to version control.

### What NOT to Do

**Never:**
- Commit API keys to version control
- Share `.env.local` files publicly
- Hardcode API keys in source code
- Deploy with embedded API keys to public hosting
- Use the same API key across multiple environments

**Always:**
- Use environment variables for local development
- Rotate API keys if they are exposed
- Monitor API usage for unexpected activity
- Keep your Google Cloud billing alerts enabled

---

## Data Handling & Privacy

### LocalStorage Usage

InfoGraphix AI stores the following data in browser LocalStorage:

| Key | Purpose | Contents |
|-----|---------|----------|
| `infographix_versions` | Version history | Generated infographics (base64 images), metadata |
| `infographix_form_draft` | Auto-save drafts | Form input state |
| `infographix_templates` | Custom templates | Style configurations |
| `infographix_batch_queues` | Batch queues | Batch generation state |
| `infographix_api_key` (AI Studio only) | API key (AI Studio managed) | Encrypted API key reference |

### Data Privacy

**What stays in your browser:**
- All generated infographics
- All saved versions and templates
- All batch queues
- Form drafts

**What is sent to Google:**
- Topic/URL/content for analysis (sent to Gemini API)
- GitHub repository names (sent to Gemini API)
- Style and palette preferences (sent to image generation API)

**What is NOT stored:**
- No server-side storage of any user data
- No analytics or tracking (beyond browser localStorage)
- No third-party data sharing

### Base64 Image Storage

Generated infographics are stored as base64-encoded PNG data URLs in localStorage. This has implications:

**Pros:**
- Completely offline after generation
- No external dependencies
- Full user control

**Cons:**
- Large images can consume localStorage quota (5-10MB limit)
- May cause quota errors with many saved versions
- Clearing browser data deletes all versions

**Recommendation:** Export important infographics to disk using the download feature.

---

## Production Deployment Considerations

### DO NOT Use Client-Side API Keys for Public Production

If you plan to deploy InfoGraphix AI publicly (outside Google AI Studio), **do not use client-side API keys**. Instead:

1. **Backend Proxy Pattern**
   - Create a backend API that holds the API key
   - Frontend calls your backend
   - Backend calls Gemini APIs
   - Implement rate limiting and authentication

2. **Example Architecture:**
   ```
   User Browser → Your Backend API → Google Gemini APIs
                   (stores API key)
                   (rate limiting)
                   (user auth)
   ```

3. **Security Measures:**
   - User authentication (OAuth, JWT)
   - Rate limiting per user/IP
   - API key rotation
   - Usage quotas and billing alerts
   - Request logging and monitoring

### Recommended Production Setup

For production deployments:

| Component | Recommendation |
|-----------|----------------|
| **Backend** | Node.js/Express, Python/FastAPI, or Go/Gin |
| **Authentication** | OAuth2, Auth0, Firebase Auth |
| **Rate Limiting** | Redis-backed rate limiter |
| **API Key Storage** | Environment variables, Secrets Manager (AWS/GCP/Azure) |
| **Monitoring** | API usage tracking, error logging |
| **CORS** | Strict origin whitelist |

---

## Security Best Practices

### For Users

1. **API Key Management**
   - Use API keys from billing-enabled Google Cloud projects
   - Monitor usage in Google Cloud Console
   - Set up billing alerts
   - Rotate keys if exposed

2. **Browser Security**
   - Use updated browsers with modern security features
   - Clear localStorage if using shared computers
   - Be cautious with browser extensions that access localStorage

3. **Data Export**
   - Regularly export important infographics
   - Don't rely solely on localStorage for long-term storage
   - Use export features (PNG, PDF, ZIP)

### For Developers

1. **Environment Variables**
   - Never commit `.env.local` to version control
   - Use separate API keys for dev/staging/production
   - Document environment setup in README

2. **Dependency Security**
   - Regularly update npm dependencies (`npm audit`)
   - Review dependency licenses
   - Monitor security advisories

3. **Code Quality**
   - Follow React security best practices
   - Sanitize user input before rendering
   - Use safe rendering methods for dynamic content
   - Implement Content Security Policy (CSP) headers

4. **Build Security**
   - Verify build artifacts before deployment
   - Use lock files (`package-lock.json`)
   - Scan containers for vulnerabilities (if using Docker)

---

## Vulnerability Reporting

### Supported Versions

| Version | Supported |
|---------|-----------|
| 1.4.x   | ✅ Yes    |
| 1.3.x   | ❌ No     |
| < 1.3   | ❌ No     |

### How to Report a Security Vulnerability

If you discover a security vulnerability in InfoGraphix AI, please report it responsibly:

1. **DO NOT** create a public GitHub issue
2. **DO** use GitHub's private vulnerability reporting or email the maintainer
3. **Include:**
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- **Initial Response:** Within 48 hours
- **Vulnerability Assessment:** Within 7 days
- **Fix Timeline:** Depends on severity
  - Critical: 1-3 days
  - High: 1-2 weeks
  - Medium: 2-4 weeks
  - Low: Next release cycle

### Security Advisories

Security advisories will be published:
- GitHub Security Advisories (for this repository)
- CHANGELOG.md (with appropriate severity labels)
- README.md (for critical vulnerabilities)

---

## Known Limitations

### Client-Side Architecture

**Limitation:** API keys are visible in browser DevTools when using local development mode.

**Mitigation:** This is acceptable for AI Studio deployment where keys are managed by Google. For public production, use a backend proxy.

**Status:** Working as designed for AI Studio use case.

### LocalStorage Quota

**Limitation:** Base64-encoded images can quickly fill localStorage quota (typically 5-10MB).

**Mitigation:**
- Export and delete old versions regularly
- Use export features to save to disk
- Clear localStorage if quota errors occur

**Status:** Documented limitation of client-side storage.

### CORS for GitHub API

**Limitation:** Direct GitHub API calls from browser may hit CORS restrictions.

**Mitigation:** Application uses Gemini's web scraping capabilities as fallback.

**Status:** Working as designed with fallback mechanism.

---

## Compliance & Standards

InfoGraphix AI follows these security standards:

| Standard | Compliance |
|----------|------------|
| **OWASP Top 10** | Reviewed for web application security |
| **Content Security Policy** | Recommended for production deployments |
| **Subresource Integrity** | Not applicable (no CDN dependencies in production build) |
| **GDPR** | No personal data collected (client-side only) |
| **SOC 2** | Not applicable (no backend infrastructure) |

---

## Security Updates

Security-related updates will be published in:
- [CHANGELOG.md](./CHANGELOG.md) with `[SECURITY]` prefix
- [GitHub Releases](https://github.com/doublegate/InfoGraphix-GenAI/releases)
- GitHub Security Advisories (for critical vulnerabilities)

Subscribe to releases for notifications of security updates.

---

## Additional Resources

- [Google Gemini API Security Best Practices](https://ai.google.dev/docs/security)
- [Google Cloud Security Documentation](https://cloud.google.com/security)
- [React Security Best Practices](https://react.dev/learn/security)
- [OWASP Client-Side Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Client_Side_Security_Cheat_Sheet.html)

---

## Questions?

For security-related questions that are **not vulnerabilities**, please:
- Open a GitHub Discussion in the Security category
- Check the [FAQ](./docs/FAQ.md) for common questions
- Review the [Architecture Documentation](./docs/ARCHITECTURE.md)

For **vulnerability reports**, follow the [Vulnerability Reporting](#vulnerability-reporting) process above.

---

**Last Updated:** 2025-12-12 (v1.7.0)
