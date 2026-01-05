# Deployment Guide

## GitHub Pages Deployment

This project is configured to automatically deploy the frontend to GitHub Pages using GitHub Actions.

### Setup Steps:

1. **Push to GitHub**: Make sure your code is pushed to the `main` branch of your GitHub repository.

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Under "Source", select "GitHub Actions"

3. **Automatic Deployment**: 
   - The GitHub Action will automatically trigger on every push to `main`
   - Your site will be available at: `https://kamilibrahim877-glitch.github.io/shopx/`

### Manual Build (Optional):

If you want to build locally and deploy manually:

```bash
cd client
npm install
npm run build
```

The built files will be in `client/dist/` directory.

### Environment Configuration:

- **Development**: Uses local backend at `http://localhost:5001`
- **Production**: Configure `VITE_API_URL` in `.env.production` to point to your deployed backend

### Demo Mode:

The frontend can run in demo mode without a backend by setting `VITE_DEMO_MODE=true` in the environment variables.

## Live Demo

Once deployed, your e-commerce platform will be accessible at:
**https://kamilibrahim877-glitch.github.io/shopx/**

### Features Available in Demo:
- ✅ Responsive design showcase
- ✅ Product catalog browsing
- ✅ Shopping cart functionality (local storage)
- ✅ Modern UI/UX demonstration
- ✅ Mobile-first design
- ⚠️ Admin features require backend connection

## Backend Deployment

For full functionality, deploy the backend to a service like:
- Heroku
- Railway
- Vercel (for API routes)
- DigitalOcean
- AWS

Then update the `VITE_API_URL` in your production environment.