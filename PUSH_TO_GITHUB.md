# Push to GitHub - Commands

## After creating the repository on GitHub.com, run these commands:

```bash
# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/popi-warning-app.git

# Push your code to GitHub
git branch -M main
git push -u origin main
```

## Example:
If your GitHub username is "johnsmith", the commands would be:

```bash
git remote add origin https://github.com/johnsmith/popi-warning-app.git
git branch -M main
git push -u origin main
```

## After pushing:
1. Go to https://vercel.com
2. Sign up with GitHub
3. Import your repository
4. Add environment variables
5. Deploy!
