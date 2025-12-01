# Environment Variables - Quick Reference

## 🚀 Quick Setup (3 Steps)

### 1. Edit Your Contract Addresses

```bash
# Edit the example file with your real values
nano .env.production.example
```

### 2. Create GitHub Secret

Go to: **Repository → Settings → Secrets → Actions → New secret**

- Name: `ENV_PRODUCTION` (or `ENV_DEV`, `ENV_TESTING`)
- Value: Paste entire content of your edited `.env.production.example`

### 3. Deploy

```bash
git push origin main  # Triggers deployment with your env vars
```

## 📝 Using Environment Variables in Code

### ❌ Old Way (Don't do this)
```typescript
const token = process.env.NEXT_PUBLIC_TOKEN_CONTRACT;
const nft = process.env.NEXT_PUBLIC_NFT_CONTRACT;
// ... repeat for 20 contracts
```

### ✅ New Way (Use this)
```typescript
import { contracts, network } from '@/config/contracts';

const token = contracts.token;
const nft = contracts.nft;
const chainId = network.networkId;
```

## 📂 File Structure

```
.env.production.example   ← Edit this, then copy to GitHub Secret
.env.dev.example         ← Edit this for dev environment
.env.testing.example     ← Edit this for testing environment
.env.local              ← Create this for local development (gitignored)
.env.production         ← Auto-created by CI/CD (gitignored)

config/contracts.ts      ← Type-safe config (use this in your code)
```

## 🔐 GitHub Secrets Needed

| Secret Name | Use Case | Source File |
|------------|----------|-------------|
| `ENV_DEV` | Development environment | `.env.dev.example` |
| `ENV_TESTING` | Testing environment | `.env.testing.example` |
| `ENV_PRODUCTION` | Production environment | `.env.production.example` |

## 💡 Common Tasks

### Add a New Contract Address

1. **Add to env files:**
```bash
# Add to all example files
echo "NEXT_PUBLIC_NEW_CONTRACT=0x..." >> .env.production.example
echo "NEXT_PUBLIC_NEW_CONTRACT=0x..." >> .env.dev.example
echo "NEXT_PUBLIC_NEW_CONTRACT=0x..." >> .env.testing.example
```

2. **Update TypeScript config** in `config/contracts.ts`:
```typescript
export type ContractAddresses = {
  // ... existing
  newContract: string;  // Add this
};

export const dAppConfig: DAppConfig = {
  // ...
  contracts: {
    // ... existing
    newContract: getEnv('NEXT_PUBLIC_NEW_CONTRACT'),
  },
};
```

3. **Update GitHub Secrets** with new content

4. **Use in your code:**
```typescript
import { contracts } from '@/config/contracts';
const myContract = contracts.newContract;
```

### Local Development Setup

```bash
# 1. Copy example to local
cp .env.dev.example .env.local

# 2. Edit with your values
nano .env.local

# 3. Start dev server
npm run dev
```

### Switch Between Networks

Just use the appropriate GitHub Secret:
- Push to `dev` branch → uses `ENV_DEV` (testnet contracts)
- Push to `testing` branch → uses `ENV_TESTING` 
- Push to `main` branch → uses `ENV_PRODUCTION` (mainnet contracts)

## 🎯 Benefits

| Before | After |
|--------|-------|
| 20 individual build-args | 1 GitHub Secret |
| Scattered process.env calls | Centralized config |
| No type safety | Full TypeScript types |
| Hard to maintain | Easy to update |
| No validation | Built-in validation |

## 🔍 Verification

After deployment, visit your app and check the footer/debug section. You should see:
- ✅ App version (git commit SHA)
- ✅ Network name
- ✅ Contract addresses loaded

## ⚡ Commands

```bash
# View current GitHub secrets (names only)
gh secret list

# Set a new secret from file
gh secret set ENV_PRODUCTION < .env.production.example

# Update existing secret
gh secret set ENV_DEV < .env.dev.example --overwrite

# Delete a secret
gh secret delete ENV_OLD
```

## 📚 Full Documentation

See `ENV_SETUP_GUIDE.md` for detailed explanation and troubleshooting.

