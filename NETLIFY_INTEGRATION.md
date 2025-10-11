# Netlify Functions + Express Integration

This project combines your Express server with Netlify functions for serverless deployment.

## How it works

### Local Development
- Run `pnpm dev` to start the Express server locally
- API endpoints are available at:
  - `http://localhost:3000/ask`
  - `http://localhost:3000/record-ip`
  - `http://localhost:3000/visitors`
  - `http://localhost:3000/contact`

### Production (Netlify)
- API endpoints are available at:
  - `https://your-site.netlify.app/api/ask`
  - `https://your-site.netlify.app/api/record-ip`
  - `https://your-site.netlify.app/api/visitors`
  - `https://your-site.netlify.app/api/contact`

## File Structure

- `src/app.ts` - Shared Express app configuration used by both local server and Netlify function
- `server.ts` - Local development server using ViteExpress
- `netlify/functions/api.ts` - Netlify function that wraps the Express app with serverless-http
- `netlify.toml` - Netlify configuration with routing rules

## Key Features

1. **Shared Code**: The same Express app logic is used for both local development and production
2. **Dual Routes**: Routes are available both with and without `/api` prefix for compatibility
3. **Serverless**: Uses `serverless-http` to make Express compatible with Netlify functions
4. **Type Safety**: Full TypeScript support with proper type declarations

## Environment Variables

Make sure to set these in your Netlify dashboard:
- `VITE_LONG_CAT_API_KEY`
- `VITE_LONG_CAT_URL`
- Any other environment variables your app needs

## Deployment

1. Push your code to your connected Git repository
2. Netlify will automatically build and deploy
3. Your API endpoints will be available at `/api/*` paths
