# Development Workflow Guide

This guide explains how to set up a dev/staging environment for testing changes before pushing to production.

## Overview

We'll use Git branches to separate development from production:
- **`main` branch** → Production (automatically deploys to `vulnerabilityhub.com`)
- **`dev` branch** → Development/Staging (deploys to a preview URL)

## Step 1: Create a Dev Branch

```bash
# Make sure you're on main and it's up to date
git checkout main
git pull origin main

# Create and switch to a new dev branch
git checkout -b dev

# Push the dev branch to GitHub
git push -u origin dev
```

## Step 2: Configure Vercel for Multiple Branches

1. **Go to Vercel Dashboard:**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click on your project

2. **Go to Settings → Git:**
   - You should see your connected GitHub repo
   - Vercel automatically creates preview deployments for all branches

3. **Configure Production Branch:**
   - Go to `Settings` → `Git`
   - Under "Production Branch", ensure it's set to `main`
   - This ensures only `main` deploys to your custom domain

4. **Preview Deployments:**
   - Every push to `dev` (or any branch) creates a preview deployment
   - Preview URLs look like: `vuln-hub-git-dev-your-username.vercel.app`
   - These are automatically generated and unique per branch/commit

## Step 3: Development Workflow

### Making Changes for Testing:

```bash
# Switch to dev branch
git checkout dev

# Make your changes to files
# ... edit files ...

# Commit changes
git add .
git commit -m "Description of changes"

# Push to dev branch (creates preview deployment)
git push origin dev
```

### After Testing on Preview:

If changes look good and you want to deploy to production:

```bash
# Switch back to main
git checkout main

# Merge dev into main
git merge dev

# Push to main (deploys to production)
git push origin main
```

### Alternative: Pull Request Workflow (Recommended)

This is safer and allows code review:

1. **Push dev branch:**
   ```bash
   git checkout dev
   git push origin dev
   ```

2. **Create Pull Request on GitHub:**
   - Go to your GitHub repo
   - Click "Pull requests" → "New pull request"
   - Select `dev` → `main`
   - Add description of changes
   - Click "Create pull request"

3. **Review and Merge:**
   - Review the changes in the PR
   - Vercel will create a preview deployment for the PR
   - Test the preview URL
   - If good, click "Merge pull request" on GitHub
   - This automatically merges to `main` and deploys to production

## Step 4: Environment Variables for Dev

You might want different environment variables for dev:

1. **In Vercel:**
   - Go to `Settings` → `Environment Variables`
   - When adding/editing variables, you can select:
     - `Production` (main branch)
     - `Preview` (all other branches)
     - `Development` (local dev)

2. **Example:**
   - Production: `NEXT_PUBLIC_SITE_URL=https://vulnerabilityhub.com`
   - Preview: `NEXT_PUBLIC_SITE_URL=https://vuln-hub-git-dev-xxx.vercel.app`

## Step 5: Quick Reference Commands

### Daily Development:

```bash
# Start working on new feature
git checkout dev
git pull origin dev  # Get latest dev changes

# Make changes, then:
git add .
git commit -m "Add new feature"
git push origin dev  # Creates preview deployment

# Test preview URL from Vercel dashboard

# If good, merge to production:
git checkout main
git merge dev
git push origin main
```

### Emergency Hotfix (direct to production):

```bash
# If you need to fix production immediately
git checkout main
# Make fix
git add .
git commit -m "Hotfix: description"
git push origin main

# Then merge back to dev:
git checkout dev
git merge main
git push origin dev
```

## Step 6: Viewing Deployments

1. **Vercel Dashboard:**
   - Go to your project
   - Click "Deployments" tab
   - You'll see all deployments:
     - Production (from `main`)
     - Preview (from `dev` and other branches)
   - Each shows the branch, commit, and status

2. **Preview URLs:**
   - Click on any preview deployment
   - Click "Visit" to see the preview site
   - Share this URL with others for testing

## Best Practices

1. **Always test on dev/preview first** before merging to main
2. **Use descriptive commit messages** so you know what changed
3. **Keep dev branch updated** by merging main into dev regularly
4. **Use pull requests** for important changes (allows review)
5. **Test thoroughly** on preview before production deploy

## Workflow Summary

```
┌─────────┐
│  Local  │
│  Dev    │
└────┬────┘
     │ git push
     ▼
┌─────────┐      Preview URL
│   Dev   │  ──────────────────►  Test Here
│ Branch  │      (auto-generated)
└────┬────┘
     │ merge (when ready)
     ▼
┌─────────┐      Production
│  Main   │  ──────────────────►  vulnerabilityhub.com
│ Branch  │      (your domain)
└─────────┘
```

## Troubleshooting

### Preview not updating?
- Make sure you pushed to the correct branch
- Check Vercel deployment logs for errors
- Verify environment variables are set for "Preview"

### Want to test specific commit?
- Vercel creates previews for every commit
- Find the commit in Vercel deployments
- Click "Visit" on that specific deployment

### Need to rollback?
- Go to Vercel → Deployments
- Find the good deployment
- Click "..." → "Promote to Production"

