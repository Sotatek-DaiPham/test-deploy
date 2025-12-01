# Next.js Docker Deployment Guide

Complete guide to deploy Next.js apps using Docker + GitHub Actions to Ubuntu server.

## 📋 Prerequisites

- Next.js project with `package.json`
- GitHub account and repository
- Docker Hub account (free at https://hub.docker.com)
- Ubuntu server (Digital Ocean, AWS, etc.)
- SSH access to your server

---

## Part 1: Dockerize Your App

### 1. Create `Dockerfile`

```dockerfile
FROM node:20-alpine AS base
RUN npm install -g pnpm

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# Run
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

> **Note:** Replace `pnpm` with `npm` or `yarn` if needed.

### 2. Create `.dockerignore`

```
node_modules
.next
.git
*.log
.DS_Store
.env*.local
```

### 3. Update `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
}

module.exports = nextConfig
```

### 4. Test Locally

```bash
docker build -t my-app .
docker run -p 3000:3000 my-app
# Open http://localhost:3000
```

---

## Part 2: Setup Docker Hub

1. Go to https://hub.docker.com → **Account Settings** → **Security**
2. Click **New Access Token**
   - Description: `github-actions`
   - Permissions: **Read, Write, Delete**
3. **Copy the token** (save it securely)

---

## Part 3: Configure Server

### 1. SSH into Server

```bash
ssh root@YOUR_SERVER_IP
```

### 2. Install Docker

```bash
apt update
apt install -y docker.io
systemctl start docker
systemctl enable docker
docker --version
```

### 3. Create SSH Key (on your local machine)

```bash
# Generate key
ssh-keygen -t rsa -b 4096 -f ~/.ssh/deploy_key -N ""

# Copy to server
ssh-copy-id -i ~/.ssh/deploy_key.pub root@YOUR_SERVER_IP

# Get private key (for GitHub Secret)
cat ~/.ssh/deploy_key
# Copy entire output including BEGIN/END lines
```

---

## Part 4: Setup GitHub Secrets

Go to: **GitHub Repo → Settings → Secrets and variables → Actions → Secrets tab**

Create these **Repository Secrets** (shared across all environments):

| Secret Name | Value |
|------------|-------|
| `DOCKER_USERNAME` | Your Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub access token |
| `DO_HOST` | Server IP address |
| `DO_USERNAME` | SSH username (usually `root`) |
| `DO_SSH_KEY` | SSH private key (entire output) |

---

## Part 5: Environment Variables (Optional)

For apps with many environment variables (APIs, contract addresses, etc.):

### 1. Create Environment Files

Create `.env.production.example`:

```bash
# App Configuration
NEXT_PUBLIC_APP_NAME=My App
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_FEATURE_FLAG=true

# Add more NEXT_PUBLIC_* variables as needed
```

### 2. Setup GitHub Environment Secret

Go to: **Settings → Environments → New environment**

1. Create environment: `production`
2. Click **Add secret**
   - Name: `ENV_FILE`
   - Value: Paste entire content of `.env.production.example`

> **Tip:** Environment secrets are environment-specific. Use `ENV_FILE` as the secret name for all environments (dev/testing/production), and each will have different values.

### 3. Update Workflow

Add `environment: production` and use the secret:

```yaml
jobs:
  deploy:
    environment: production    # ← Links to environment
    steps:
      - name: Create environment file
        run: |
          echo "${{ secrets.ENV_FILE }}" > .env.production
          echo "NEXT_PUBLIC_APP_VERSION=${{ github.sha }}" >> .env.production
```

### 4. Update `.gitignore`

```
.env.production
.env.dev
.env.testing
```

> Next.js automatically loads `.env.production` during build.

---

## Part 6: Create GitHub Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

run-name: 🚀 Deploy by @${{ github.actor }} (${{ github.sha }})

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      # Optional: Only if using environment variables
      - name: Create environment file
        run: |
          echo "${{ secrets.ENV_FILE }}" > .env.production
          echo "NEXT_PUBLIC_APP_VERSION=${{ github.sha }}" >> .env.production
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/my-app:latest
      
      - name: Deploy to Server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.DO_HOST }}
          username: ${{ secrets.DO_USERNAME }}
          key: ${{ secrets.DO_SSH_KEY }}
          script: |
            docker pull ${{ secrets.DOCKER_USERNAME }}/my-app:latest
            docker stop my-app || true
            docker rm my-app || true
            docker run -d \
              --name my-app \
              -p 3000:3000 \
              --restart unless-stopped \
              ${{ secrets.DOCKER_USERNAME }}/my-app:latest
```

**Customize:**
- Replace `my-app` with your app name
- Change port if needed
- Remove "Create environment file" step if not using env variables

---

## Part 7: Deploy! 🚀

```bash
git add .
git commit -m "Setup Docker deployment"
git push
```

**Watch deployment:**
1. Go to GitHub → **Actions** tab
2. Wait for green checkmark ✅
3. Access your app: `http://YOUR_SERVER_IP:3000`

---

## Part 8: Multi-Environment Setup (Optional)

For dev/testing/production environments on the same server:

### 1. Create GitHub Environments

Go to: **Settings → Environments**

Create three environments:
- `dev`
- `testing`  
- `production`

For each environment, add **Environment Secret**:
- Name: `ENV_FILE`
- Value: Paste content from `.env.dev.example`, `.env.testing.example`, or `.env.production.example`

### 2. Create Separate Workflows

**`.github/workflows/deploy-dev.yml`:**
```yaml
name: Deploy to Development

on:
  push:
    branches: [dev]

run-name: 🚀 Deploy to DEV by @${{ github.actor }}

jobs:
  deploy-dev:
    runs-on: ubuntu-latest
    environment: dev    # ← Uses "dev" environment secrets
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Create environment file
        run: |
          echo "${{ secrets.ENV_FILE }}" > .env.production
          echo "NEXT_PUBLIC_APP_VERSION=${{ github.sha }}" >> .env.production
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/my-app:dev
      
      - name: Deploy to Development Server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.DO_HOST }}
          username: ${{ secrets.DO_USERNAME }}
          key: ${{ secrets.DO_SSH_KEY }}
          script: |
            docker pull ${{ secrets.DOCKER_USERNAME }}/my-app:dev
            docker stop my-app-dev || true
            docker rm my-app-dev || true
            docker run -d \
              --name my-app-dev \
              -p 3001:3000 \
              --restart unless-stopped \
              ${{ vars.DOCKER_USERNAME }}/my-app:dev
```

**`.github/workflows/deploy-testing.yml`:**
```yaml
name: Deploy to Testing

on:
  push:
    branches: [testing]

run-name: 🧪 Deploy to TESTING by @${{ github.actor }}

jobs:
  deploy-testing:
    runs-on: ubuntu-latest
    environment: testing    # ← Uses "testing" environment secrets
    
    steps:
      # Same steps as deploy-dev.yml, but:
      # - Tags: my-app:testing
      # - Port: 3002
      # - Container name: my-app-testing
```

> **Note:** Both workflows use `${{ secrets.ENV_FILE }}` but get different values based on the `environment` context!

### 3. Access URLs

```
Dev:     http://YOUR_SERVER_IP:3001
Testing: http://YOUR_SERVER_IP:3002
Prod:    http://YOUR_SERVER_IP:3000
```

### 4. Benefits of This Approach

✅ Same workflow code for all environments  
✅ Environment-specific secrets automatically selected  
✅ Can add protection rules (require approvals for production)  
✅ Clear separation between environments

---

## Part 9: HTTPS with Custom Domain (Optional)

### 1. Point Domain to Server

Add A record: `@` → `YOUR_SERVER_IP`

### 2. Install Nginx + Certbot

```bash
apt update
apt install -y nginx certbot python3-certbot-nginx
```

### 3. Configure Nginx

```bash
nano /etc/nginx/sites-available/my-app
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/my-app /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 4. Get SSL Certificate

```bash
certbot --nginx -d yourdomain.com
```

### 5. Open Firewall

```bash
ufw allow 80/tcp
ufw allow 443/tcp
```

Access: `https://yourdomain.com` 🔒

---

## 🔧 Useful Commands

```bash
# View running containers
docker ps

# View logs
docker logs my-app
docker logs -f my-app  # Follow logs

# Restart container
docker restart my-app

# Check resource usage
docker stats

# SSH into container
docker exec -it my-app sh

# Remove all stopped containers
docker container prune
```

---

## 🐛 Troubleshooting

**Build fails:**
- Check `.dockerignore` includes `node_modules`
- Verify `output: 'standalone'` in `next.config.js`

**SSH authentication fails:**
- Verify `DO_SSH_KEY` includes BEGIN/END lines
- Test locally: `ssh -i ~/.ssh/deploy_key root@SERVER_IP`

**Port already in use:**
```bash
docker stop my-app
# Or use different port: -p 3001:3000
```

**Container exits immediately:**
```bash
docker logs my-app  # Check error logs
```

---

## 📚 Resources

- [Docker Docs](https://docs.docker.com/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Let's Encrypt](https://letsencrypt.org/)

---

**Happy Deploying! 🚀**
