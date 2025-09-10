# 🚀 Vercel Deployment Guide for Popi Warning App

## Prerequisites

1. **GitHub Account** - You need a GitHub account
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **API Keys** - Ensure you have all required API keys

## Step 1: Push to GitHub

### Option A: Create New Repository on GitHub
1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `popi-warning-app` (or any name you prefer)
3. Make it public or private (your choice)
4. **Don't** initialize with README, .gitignore, or license (we already have these)

### Option B: Use Existing Repository
If you already have a repository, just push to it.

### Push Your Code
```bash
# Add your GitHub repository as remote (replace with your actual repo URL)
git remote add origin https://github.com/YOUR_USERNAME/popi-warning-app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### Method 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from your project directory
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name: popi-warning-app
# - Directory: ./
# - Override settings? No
```

### Method 2: Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

## Step 3: Configure Environment Variables

### In Vercel Dashboard:
1. Go to your project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables"
4. Add each variable from your `.env.local`:

```
NEXT_PUBLIC_MAPTILER_API_KEY = 0n3hIGbHnipUHJE5pew7
NEXT_PUBLIC_LOCATIONIQ_API_KEY = pk.092190a364d11fb177752f5ff2d2b8ca
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyBgk6r_OseUsmtoikoFq61kW1cFy8LTcWQ
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = popiwarningapp.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = popiwarningapp
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = popiwarningapp.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 791836519675
NEXT_PUBLIC_FIREBASE_APP_ID = 1:791836519675:web:38de74d0308d341890945e
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = G-LVPT7G23EJ
OSM_LOGIN = s.brosset@me.com
OSM_PASSWORD = mobdIw-gybgi3-navjyz
OSM_API_URL = https://api06.dev.openstreetmap.org/
```

### Important Notes:
- **Set Environment**: Select "Production", "Preview", and "Development" for all variables
- **OSM Credentials**: These are server-side only, so they won't be exposed to the client
- **Firebase Keys**: These are safe to expose (they're public keys)

## Step 4: Configure Firebase for Production

### 1. Add Vercel Domain to Firebase
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `popiwarningapp`
3. Go to "Authentication" > "Settings" > "Authorized domains"
4. Add your Vercel domain: `your-app-name.vercel.app`

### 2. Configure Firestore Rules
```javascript
// In Firebase Console > Firestore > Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own warnings
    match /warnings/{warningId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Allow public read access to warnings (optional)
    match /warnings/{warningId} {
      allow read: if true;
    }
  }
}
```

### 3. Enable Authentication Providers
1. Go to "Authentication" > "Sign-in method"
2. Enable:
   - ✅ Email/Password
   - ✅ Google
   - ✅ Apple (if you have Apple Developer account)
   - ✅ Anonymous

## Step 5: Test Your Deployment

### 1. Check Build Logs
- Go to Vercel dashboard > Your project > "Deployments"
- Check that the build completed successfully

### 2. Test Core Features
- ✅ App loads without errors
- ✅ Map displays correctly
- ✅ Search functionality works
- ✅ Authentication works
- ✅ PWA installation works (on mobile)

### 3. Test PWA Features
- On mobile: Add to home screen
- Check that it works offline (basic functionality)
- Test push notifications (if implemented)

## Step 6: Custom Domain (Optional)

### Add Custom Domain in Vercel:
1. Go to project settings > "Domains"
2. Add your custom domain
3. Configure DNS records as instructed
4. Update Firebase authorized domains

## Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check environment variables are set correctly
   - Ensure all dependencies are in package.json
   - Check build logs in Vercel dashboard

2. **Map Not Loading**
   - Verify MapTiler API key is correct
   - Check browser console for errors
   - Ensure API key has proper permissions

3. **Authentication Issues**
   - Verify Firebase configuration
   - Check authorized domains include Vercel domain
   - Ensure authentication providers are enabled

4. **Search Not Working**
   - Verify LocationIQ API key
   - Check API quota limits
   - Test API key directly

### Getting Help:
- Check Vercel deployment logs
- Check browser console for errors
- Verify all environment variables are set
- Test API keys individually

## Post-Deployment Checklist

- [ ] App loads successfully
- [ ] Map displays with MapTiler tiles
- [ ] Search functionality works
- [ ] Authentication works (all providers)
- [ ] PWA can be installed
- [ ] Firebase connection works
- [ ] All environment variables are set
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate is active
- [ ] Performance is acceptable

## Monitoring and Maintenance

### Vercel Analytics
- Enable Vercel Analytics in project settings
- Monitor performance and usage

### Firebase Monitoring
- Check Firebase console for usage
- Monitor authentication and Firestore usage
- Set up billing alerts if needed

### API Usage Monitoring
- Monitor MapTiler usage
- Monitor LocationIQ usage
- Set up alerts for quota limits

---

🎉 **Congratulations!** Your Popi Warning App is now live on Vercel!

**Next Steps:**
1. Share your app with users
2. Monitor usage and performance
3. Implement remaining features (OSM editing, warnings)
4. Add push notifications
5. Optimize based on user feedback
