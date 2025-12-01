# Complete Guide: Deploy Next.js App with Docker + GitHub Actions

This guide shows you how to deploy any Next.js (or React) frontend project to an Ubuntu server using Docker and GitHub Actions for CI/CD.

## 📋 Prerequisites

- [ ] Next.js/React project with `package.json`
- [ ] GitHub account and repository
- [ ] Docker Hub account (free at https://hub.docker.com)
- [ ] Ubuntu server (Digital Ocean, AWS, Linode, etc.)
- [ ] SSH access to your server

---

## Part 1: Dockerize Your Application

### Step 1: Create `Dockerfile`

Create a file named `Dockerfile` in your project root:

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
COPY package.json pnpm-lock.yaml ./
COPY . .
RUN pnpm run build

# Run
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

**Notes:**
- If using `npm` instead of `pnpm`, replace `pnpm` with `npm` and use `package-lock.json`
- For yarn, replace with `yarn` and `yarn.lock`

---

### Step 2: Create `.dockerignore`

Create `.dockerignore` in project root:

```
node_modules
.next
.git
*.log
npm-debug.log*
.DS_Store
.env*.local
dist
```

---

### Step 3: Update `next.config.js`

Add `output: 'standalone'` to enable Docker optimization:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
}

module.exports = nextConfig
```

---

### Step 4: Test Docker Build Locally

```bash
# Make sure Docker Desktop is running
docker build -t my-app .

# Test it
docker run -p 3000:3000 my-app

# Open http://localhost:3000 to verify
```

---

## Part 2: Set Up Docker Hub

### Step 1: Create Access Token

1. Go to https://hub.docker.com
2. Sign in
3. Click your username → **Account Settings**
4. Go to **Security** → **Access Tokens**
5. Click **New Access Token**
   - Description: `github-actions`
   - Permissions: **Read, Write, Delete**
6. **Copy the token** (you won't see it again!)

---

## Part 3: Create GitHub Actions Workflow

### Step 1: Create Workflow File

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy App

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/my-app:latest
      
      - name: Deploy to Server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USERNAME }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            docker pull ${{ secrets.DOCKER_USERNAME }}/my-app:latest
            docker stop my-app || true
            docker rm my-app || true
            docker run -d --name my-app -p 3000:3000 --restart unless-stopped ${{ secrets.DOCKER_USERNAME }}/my-app:latest
```

**Customize:**
- Change `my-app` to your app name
- Change port `3000` if needed
- Change branch from `main` to `master` if needed

---

## Part 4: Configure GitHub Secrets

### Step 1: Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

Add these secrets:

| Secret Name | Value | Example |
|-------------|-------|---------|
| `DOCKER_USERNAME` | Your Docker Hub username | `john123` |
| `DOCKER_PASSWORD` | Docker Hub access token | `dckr_pat_abc123...` |
| `SERVER_HOST` | Your server IP address | `152.42.235.140` |
| `SERVER_USERNAME` | SSH username (usually `root`) | `root` |
| `SERVER_SSH_KEY` | SSH private key (see below) | |

---

## Part 5: Set Up Your Ubuntu Server

### Step 1: SSH into Your Server

```bash
ssh root@YOUR_SERVER_IP
```

Enter your password when prompted.

---

### Step 2: Install Docker

```bash
# Update packages
apt update

# Install Docker
apt install -y docker.io

# Start Docker
systemctl start docker
systemctl enable docker

# Verify
docker --version
```

---

### Step 3: Create SSH Key for GitHub Actions

**On your local machine** (not the server):

```bash
# Generate SSH key
ssh-keygen -t rsa -b 4096 -f ~/.ssh/deploy_key -N ""

# Copy public key to server
ssh-copy-id -i ~/.ssh/deploy_key.pub root@YOUR_SERVER_IP

# Test it works
ssh -i ~/.ssh/deploy_key root@YOUR_SERVER_IP
# Should log in without password
```

---

### Step 4: Get Private Key for GitHub Secret

```bash
# Display private key
cat ~/.ssh/deploy_key
```

**Copy the ENTIRE output** including:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...all the lines...
-----END OPENSSH PRIVATE KEY-----
```

Paste this as the value for `SERVER_SSH_KEY` secret in GitHub.

---

## Part 6: Deploy!

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Add Docker and GitHub Actions deployment"
git push
```

---

### Step 2: Watch Deployment

1. Go to your GitHub repository
2. Click **Actions** tab
3. Watch the workflow run (takes 3-5 minutes)
4. Wait for green checkmark ✅

---

### Step 3: Access Your App

Open browser:
```
http://YOUR_SERVER_IP:3000
```

🎉 **Your app is live!**

---

## Part 7: Set Up Custom Domain + HTTPS (Optional)

### Prerequisites

- Domain name (buy from Namecheap, Cloudflare, or use free DuckDNS)
- Point domain's A record to your server IP

---

### Step 1: Install Nginx

```bash
apt update
apt install -y nginx certbot python3-certbot-nginx
systemctl start nginx
systemctl enable nginx
```

---

### Step 2: Configure Nginx

Create config file:

```bash
nano /etc/nginx/sites-available/my-app
```

Paste (replace `yourdomain.com`):

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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable it:

```bash
ln -s /etc/nginx/sites-available/my-app /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

### Step 3: Get SSL Certificate

```bash
certbot --nginx -d yourdomain.com
```

Follow prompts:
- Enter email
- Agree to terms
- Certbot will automatically configure HTTPS

---

### Step 4: Open Firewall Ports

```bash
ufw allow 80/tcp
ufw allow 443/tcp
```

**Or** configure in your cloud provider's firewall dashboard.

---

### Step 5: Access via HTTPS

```
https://yourdomain.com
```

🔒 **Secure site with SSL!**

---

## 🔄 How to Update Your App

Every time you want to deploy changes:

```bash
git add .
git commit -m "Your changes"
git push
```

GitHub Actions will automatically:
1. Build new Docker image
2. Push to Docker Hub
3. Deploy to your server

**Wait 3-5 minutes** → Changes are live! 🚀

---

## 📝 Common Issues & Solutions

### Issue: Docker build fails

**Solution:** Check `.dockerignore` includes `node_modules` and `.next`

---

### Issue: GitHub Actions can't SSH

**Solution:** 
- Verify `SERVER_SSH_KEY` secret includes BEGIN/END lines
- Test SSH key locally: `ssh -i ~/.ssh/deploy_key root@SERVER_IP`

---

### Issue: Port already in use

**Solution:**
```bash
# Find what's using the port
lsof -i :3000

# Stop the container
docker stop my-app

# Or use different port in workflow
docker run -p 3001:3000 ...
```

---

### Issue: SSL certificate fails

**Solution:**
- Verify domain DNS points to correct IP: `ping yourdomain.com`
- Make sure ports 80 and 443 are open in firewall
- Wait 10-15 minutes for DNS propagation after updating

---

## 🎯 Next Steps

- [ ] Set up environment variables (use GitHub secrets and pass to docker run)
- [ ] Add database (PostgreSQL, MongoDB)
- [ ] Set up monitoring (PM2, Datadog)
- [ ] Add staging environment
- [ ] Set up automatic backups

---

## 📚 Resources

- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Let's Encrypt](https://letsencrypt.org/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

**Made with ❤️ - Good luck with your deployment!**

