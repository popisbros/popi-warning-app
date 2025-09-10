# Quick Deployment Commands

## After creating GitHub repository, run these commands:

```bash
# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/popi-warning-app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Then deploy to Vercel:

1. Go to https://vercel.com
2. Sign up with GitHub
3. Import your repository
4. Add environment variables (see VERCEL_DEPLOYMENT.md)
5. Deploy!

## Your app will be available at:
https://your-app-name.vercel.app
