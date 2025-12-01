# Environment Variables Setup Guide for dApp

This guide explains how to configure environment variables for your dApp with multiple contract addresses using GitHub Secrets.

## Overview

Instead of defining 10-20 build arguments individually, we use a **single `.env` file approach** where all environment variables are stored in GitHub Secrets and injected during the build process.

## Architecture

```
GitHub Secrets (ENV_DEV, ENV_TESTING, ENV_PRODUCTION)
    ↓
GitHub Workflow creates .env.production file
    ↓
Docker build reads .env.production
    ↓
Next.js embeds variables into JavaScript bundle
    ↓
Your app accesses them via config/contracts.ts
```

## Step-by-Step Setup

### 1. Prepare Your Environment Files

We've created example files for each environment:

- `.env.production.example` - Template for production/mainnet
- `.env.dev.example` - Template for development/testnet

**Edit these files** with your actual contract addresses and configuration.

### 2. Create GitHub Secrets

#### Option A: Using GitHub Web Interface

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Create the following secrets:

**For Development Environment:**
- **Name:** `ENV_DEV`
- **Value:** Copy the entire content of `.env.dev.example` (with your real values)

**For Testing Environment:**
- **Name:** `ENV_TESTING`
- **Value:** Copy the content of your testing environment file

**For Production Environment:**
- **Name:** `ENV_PRODUCTION`
- **Value:** Copy the entire content of `.env.production.example` (with your real values)

#### Option B: Using GitHub CLI

```bash
# Set ENV_DEV secret
gh secret set ENV_DEV < .env.dev.example

# Set ENV_TESTING secret
gh secret set ENV_TESTING < .env.testing.example

# Set ENV_PRODUCTION secret
gh secret set ENV_PRODUCTION < .env.production.example
```

### 3. Configure Your Contracts

Edit `.env.production.example` with your actual values:

```bash
# Network Configuration
NEXT_PUBLIC_NETWORK_ID=1
NEXT_PUBLIC_CHAIN_NAME=Ethereum Mainnet
NEXT_PUBLIC_RPC_URL=https://mainnet.infura.io/v3/YOUR_ACTUAL_KEY

# Contract Addresses - Replace with your deployed contracts
NEXT_PUBLIC_TOKEN_CONTRACT=0x1234567890123456789012345678901234567890
NEXT_PUBLIC_NFT_CONTRACT=0x2345678901234567890123456789012345678901
NEXT_PUBLIC_STAKING_CONTRACT=0x3456789012345678901234567890123456789012
# ... add all your contract addresses
```

### 4. Verify the Workflow Configuration

The workflow (`.github/workflows/deploy-multi-env.yml`) has been updated to:

1. **Create the env file from the secret:**
```yaml
- name: Create environment file
  run: |
    echo "${{ secrets.ENV_DEV }}" > .env.production
    echo "NEXT_PUBLIC_APP_VERSION=${{ github.sha }}" >> .env.production
```

2. **Build Docker image** (no build-args needed):
```yaml
- name: Build and push Docker image
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: ${{ secrets.DOCKER_USERNAME }}/todo-app:dev
```

### 5. Use Contract Addresses in Your Code

Instead of accessing `process.env` directly everywhere, use the centralized config:

```typescript
import { contracts, network, dAppConfig } from '@/config/contracts';

export default function MyComponent() {
  // Access contract addresses
  const tokenAddress = contracts.token;
  const nftAddress = contracts.nft;
  
  // Access network info
  const chainId = network.networkId;
  const chainName = network.chainName;
  
  // Access full config
  const appName = dAppConfig.appName;
  
  return (
    <div>
      <p>Token Contract: {tokenAddress}</p>
      <p>Network: {chainName}</p>
    </div>
  );
}
```

## Benefits of This Approach

✅ **Single Source of Truth** - All env vars in one place per environment  
✅ **Type Safety** - TypeScript types for all config values  
✅ **Easy Management** - Update GitHub Secret instead of 20 individual vars  
✅ **Validation** - Built-in config validation in `config/contracts.ts`  
✅ **Clean Workflow** - No messy build-args lists  
✅ **Environment Specific** - Different contracts for dev/testing/production  

## Local Development

For local development, create a `.env.local` file:

```bash
# Copy from example
cp .env.dev.example .env.local

# Edit with your local values
nano .env.local
```

Next.js will automatically load `.env.local` during `npm run dev`.

## Adding New Environment Variables

1. **Add to the example files:**
   - Edit `.env.production.example`
   - Edit `.env.dev.example`
   - Add your new variable: `NEXT_PUBLIC_YOUR_NEW_VAR=value`

2. **Update TypeScript types** in `config/contracts.ts`:
```typescript
export type DAppConfig = {
  // ... existing fields
  yourNewVar: string; // Add this
};

export const dAppConfig: DAppConfig = {
  // ... existing fields
  yourNewVar: getEnv('NEXT_PUBLIC_YOUR_NEW_VAR', 'default'),
};
```

3. **Update GitHub Secrets:**
   - Update the `ENV_DEV`, `ENV_TESTING`, and `ENV_PRODUCTION` secrets
   - Add the new variable to each secret's content

4. **Deploy:**
   - Push to your branch (dev/testing/main)
   - The workflow will automatically use the updated secret

## Troubleshooting

### Variables showing as undefined

**Problem:** Contract addresses show as empty or undefined.

**Solutions:**
1. Verify GitHub Secret exists and contains the variable
2. Check variable name matches exactly (case-sensitive)
3. Ensure variable has `NEXT_PUBLIC_` prefix for client-side access
4. Rebuild the Docker image (secrets are injected at build time)

### Build fails with "Invalid environment"

**Problem:** Docker build fails.

**Solutions:**
1. Verify the secret is properly formatted (no extra quotes)
2. Check for special characters that need escaping
3. View GitHub Actions logs to see the actual error

### Local development not working

**Problem:** Variables work in production but not locally.

**Solutions:**
1. Create `.env.local` file in project root
2. Copy content from `.env.dev.example`
3. Restart the dev server: `npm run dev`

## Security Notes

⚠️ **Never commit actual `.env.production` or `.env.dev` files to git**  
⚠️ Only commit `.env.*.example` files (with placeholder values)  
⚠️ Contract addresses are public on blockchain anyway, but keep RPC keys private  
⚠️ Use GitHub's encrypted secrets for sensitive data  

## Example: Complete Flow

```bash
# 1. Edit your environment file
nano .env.production.example

# 2. Copy content and create GitHub Secret
# Go to: Settings → Secrets → Actions → New secret
# Name: ENV_PRODUCTION
# Value: <paste entire file content>

# 3. Push to trigger deployment
git add .
git commit -m "Update contract addresses"
git push origin main

# 4. GitHub Actions will:
#    - Create .env.production from secret
#    - Build Docker image with env vars
#    - Deploy to server
```

## Reference

- Example files: `.env.production.example`, `.env.dev.example`
- Config file: `config/contracts.ts`
- Workflow: `.github/workflows/deploy-multi-env.yml`
- Usage example: `app/page.tsx`

