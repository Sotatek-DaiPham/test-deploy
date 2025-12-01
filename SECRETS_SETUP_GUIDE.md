# GitHub Secrets Setup Guide

Quick reference for setting up secrets and variables for your deployment.

## 📋 Step-by-Step Setup

### Step 1: Repository Secrets (Shared Across All Environments)

Go to: **Settings → Secrets and variables → Actions → Secrets tab**

Click **New repository secret** and create:

```
Name: DOCKER_USERNAME
Value: yourusername

Name: DOCKER_PASSWORD
Value: dckr_pat_abc123xyz...

Name: DO_HOST  
Value: 123.45.67.89

Name: DO_USERNAME
Value: root

Name: DO_SSH_KEY
Value: -----BEGIN OPENSSH PRIVATE KEY-----
       [entire private key content]
       -----END OPENSSH PRIVATE KEY-----
```

### Step 2: Environment Secrets (Environment-Specific)

#### For Dev Environment:

1. Go to: **Settings → Environments → New environment**
2. Name: `dev`
3. Click **Add secret**

```
Name: ENV_FILE
Value: [paste entire content of .env.dev.example]

Example:
NEXT_PUBLIC_APP_NAME=My App (Dev)
NEXT_PUBLIC_NETWORK_ID=11155111
NEXT_PUBLIC_TOKEN_CONTRACT=0xabc...
NEXT_PUBLIC_NFT_CONTRACT=0xdef...
[... all your dev environment variables]
```

#### For Testing Environment:

1. Go to: **Settings → Environments** → **New environment**
2. Name: `testing`
3. Click **Add secret**

```
Name: ENV_FILE
Value: [paste entire content of .env.testing.example]
```

#### For Production (Optional):

1. Go to: **Settings → Environments** → **New environment**
2. Name: `production`
3. Click **Add secret**

```
Name: ENV_FILE
Value: [paste entire content of .env.production.example]
```

**Optional:** Add protection rules:
- ✅ Required reviewers
- ✅ Wait timer (e.g., 10 minutes)
- ✅ Deployment branches (only `main`)

---

## 📊 Quick Reference

### What Goes Where?

| Type | Where to Put | Example |
|------|-------------|---------|
| **Shared credentials** | Repository Secrets | `DOCKER_USERNAME`, `DOCKER_PASSWORD` |
| **Server access** | Repository Secrets | `DO_HOST`, `DO_USERNAME`, `DO_SSH_KEY` |
| **Environment-specific config** | Environment Secrets | `ENV_FILE` (different per env) |

### Decision Tree

```
Is it the same for all environments?
├─ YES → Repository Secret
│   (DOCKER_USERNAME, DO_HOST, DO_SSH_KEY, etc.)
│
└─ NO → Environment Secret
    (ENV_FILE - different content for dev/testing/production)
```

---

## 🔄 Migration from Repository Secrets

If you currently have `ENV_DEV` and `ENV_TESTING` as **Repository Secrets**, migrate them:

### Before (Repository Secrets):
```
Repository Secrets:
├─ ENV_DEV           ← Delete this
└─ ENV_TESTING       ← Delete this
```

### After (Environment Secrets):
```
Environment: dev
└─ ENV_FILE          ← Create this (use ENV_DEV content)

Environment: testing
└─ ENV_FILE          ← Create this (use ENV_TESTING content)
```

### Migration Steps:

1. **Copy existing values** (you can't view them, so use your local `.env.*.example` files)

2. **Create environments:**
   - Settings → Environments → New environment: `dev`
   - Settings → Environments → New environment: `testing`

3. **Add ENV_FILE secret to each environment:**
   - In `dev` environment: Add secret `ENV_FILE` with dev values
   - In `testing` environment: Add secret `ENV_FILE` with testing values

4. **Update workflows:**
   ```yaml
   # Change from:
   echo "${{ secrets.ENV_DEV }}" > .env.production
   
   # To:
   echo "${{ secrets.ENV_FILE }}" > .env.production
   ```

5. **Test deployment** to each environment

6. **Delete old secrets** (optional):
   - Delete `ENV_DEV` from Repository Secrets
   - Delete `ENV_TESTING` from Repository Secrets

---

## ✅ Verification Checklist

After setup, verify you have:

### Repository Secrets (5)
- [ ] `DOCKER_USERNAME`
- [ ] `DOCKER_PASSWORD`
- [ ] `DO_HOST`
- [ ] `DO_USERNAME`
- [ ] `DO_SSH_KEY`

### Environment: dev (1)
- [ ] `ENV_FILE`

### Environment: testing (1)
- [ ] `ENV_FILE`

### Environment: production (1, optional)
- [ ] `ENV_FILE`

---

## 🔍 How to Check

```bash
# List repository secrets (names only)
gh secret list

# Cannot list environment secrets via CLI
# Must check in GitHub UI: Settings → Environments → [env name]
```

---

## 💡 Pro Tips

### 1. Keep Local Copies

Never commit these to git, but keep them for reference:

```bash
# Create a safe backup folder
mkdir -p ~/.env-backups

# Save your env files
cp .env.dev.example ~/.env-backups/ENV_FILE_dev.txt
cp .env.testing.example ~/.env-backups/ENV_FILE_testing.txt
```

### 2. Use GitHub CLI

```bash
# Set repository secrets
gh secret set DOCKER_USERNAME --body "yourusername"
gh secret set DOCKER_PASSWORD < token.txt

# Environment secrets must be set via web UI
```

### 3. Document Your Values

Add comments in your `.example` files:

```bash
# .env.dev.example
# Last updated: 2024-12-01
# Network: Sepolia Testnet
# Deployed by: john@example.com

NEXT_PUBLIC_NETWORK_ID=11155111
NEXT_PUBLIC_TOKEN_CONTRACT=0xabc...
```

---

## 🚨 Common Issues

**Problem:** "Secret not found"  
**Solution:** Check you're using the right name and context (repository vs environment)

**Problem:** "Can't see secret value"  
**Solution:** This is normal! Secrets are encrypted. Use your local `.example` files as reference.

**Problem:** "Workflow uses wrong environment"  
**Solution:** Check `environment: dev` is set in the job, not in steps.

---

## 📚 More Info

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub Environments Documentation](https://docs.github.com/en/actions/deployment/targeting-different-environments)
- [GitHub Variables Documentation](https://docs.github.com/en/actions/learn-github-actions/variables)

---

**Ready to deploy? Check your GitHub Actions tab after pushing!** 🚀

