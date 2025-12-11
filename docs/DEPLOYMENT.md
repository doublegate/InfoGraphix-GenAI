# Deployment Guide

This document covers deployment options for InfoGraphix AI.

## Deployment Options

| Platform | Complexity | Best For |
|----------|------------|----------|
| Google AI Studio | Low | Primary deployment, integrated API key management |
| Vercel | Low | Public hosting, CI/CD |
| Netlify | Low | Static hosting, forms |
| GitHub Pages | Low | Simple static hosting |
| Self-hosted | Medium | Full control, private deployment |

## Google AI Studio Deployment

Google AI Studio is the primary deployment target, providing integrated API key management.

### Prerequisites

1. Google Cloud account with billing enabled
2. Gemini API access (paid tier recommended)
3. Google AI Studio access

### Deployment Steps

1. **Build the Application**

   ```bash
   npm run build
   ```

2. **Upload to AI Studio**

   - Navigate to Google AI Studio
   - Create a new project or select existing
   - Upload the `dist/` folder contents

3. **Configure API Access**

   - AI Studio handles API key management via `window.aistudio`
   - Users select their API key through the built-in interface

### AI Studio Integration

The application detects AI Studio environment:

```typescript
// Check if running in AI Studio
if (typeof window.aistudio !== 'undefined') {
  // Use AI Studio API key management
  if (!window.aistudio.hasSelectedApiKey()) {
    window.aistudio.openSelectKey();
  }
} else {
  // Fallback to environment variable
  const apiKey = process.env.API_KEY;
}
```

## Vercel Deployment

### Prerequisites

- Vercel account
- GitHub repository connected to Vercel

### Configuration

Create `vercel.json` in project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Environment Variables

Set in Vercel dashboard:

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Your Gemini API key (for server-side use) |

### Deploy

1. Push to GitHub
2. Vercel auto-deploys on push to main branch
3. Or use Vercel CLI:

   ```bash
   npx vercel --prod
   ```

## Netlify Deployment

### Configuration

Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Deploy

1. Connect GitHub repository to Netlify
2. Configure build settings
3. Deploy

Or use Netlify CLI:

```bash
npx netlify deploy --prod --dir=dist
```

## GitHub Pages Deployment

### Configuration

Update `vite.config.ts` for GitHub Pages:

```typescript
export default defineConfig({
  base: '/InfoGraphix-GenAI/', // Repository name
  plugins: [react()],
});
```

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Enable GitHub Pages

1. Go to repository Settings > Pages
2. Source: GitHub Actions

## Self-Hosted Deployment

### Using Docker

Create `Dockerfile`:

```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Build and run:

```bash
docker build -t infographix-ai .
docker run -p 8080:80 infographix-ai
```

### Using Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

Run:

```bash
docker-compose up -d
```

## Environment Configuration

### Development

Create `.env.local`:

```bash
GEMINI_API_KEY=your_development_api_key
```

### Production

Set environment variables based on your platform:

| Platform | Method |
|----------|--------|
| Vercel | Dashboard > Settings > Environment Variables |
| Netlify | Dashboard > Site settings > Environment variables |
| Docker | `-e` flag or `.env` file |
| Self-hosted | System environment or `.env` file |

## API Key Security

### Best Practices

1. **Never commit API keys** - Use `.env.local` (gitignored)
2. **Use environment variables** - Platform-specific configuration
3. **Rotate keys regularly** - Especially after any potential exposure
4. **Monitor usage** - Check Google Cloud Console for anomalies

### Client-Side Considerations

This is a client-side application. API keys used directly in the browser are visible to users.

**For Google AI Studio deployment**: The `window.aistudio` interface handles key management securely.

**For other deployments**: Consider:
- Using user-provided API keys
- Implementing a backend proxy
- Rate limiting and monitoring

## Performance Optimization

### Build Optimization

Vite automatically optimizes the production build:

- Tree shaking
- Code splitting
- Minification
- Asset optimization

### CDN Configuration

TailwindCSS is loaded via CDN. For production, consider:

1. **Self-hosting TailwindCSS**:
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

2. **Purging unused styles** (automatic with Tailwind JIT)

### Caching Strategy

Configure your server/CDN:

| Asset Type | Cache Duration |
|------------|----------------|
| HTML | No cache or short (5 min) |
| JS/CSS | Long (1 year, immutable) |
| Images | Long (1 year) |

## Monitoring and Analytics

### Error Tracking

Consider integrating:

- Sentry for error tracking
- LogRocket for session replay
- Google Analytics for usage metrics

### Health Checks

For self-hosted deployments, implement a health check endpoint or use the index.html response as a basic health indicator.

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Blank page after deploy | Check `base` in vite.config.ts matches deployment path |
| API errors | Verify API key is set and has correct permissions |
| 404 on refresh | Configure SPA fallback (rewrites to index.html) |
| CORS errors | Gemini API should allow browser requests; check API key restrictions |

### Debug Mode

For debugging deployed applications:

```typescript
// Add to App.tsx for debug info
if (process.env.NODE_ENV === 'development') {
  console.log('Environment:', {
    hasAIStudio: typeof window.aistudio !== 'undefined',
    hasApiKey: !!process.env.API_KEY
  });
}
```
