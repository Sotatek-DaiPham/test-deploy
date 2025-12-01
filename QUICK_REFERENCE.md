# Quick Reference - Deployment Commands

## 🐳 Docker Commands

```bash
# Build image
docker build -t app-name .

# Run container
docker run -d --name app-name -p 3000:3000 app-name

# View running containers
docker ps

# View all containers
docker ps -a

# Stop container
docker stop app-name

# Remove container
docker rm app-name

# View logs
docker logs app-name

# Follow logs
docker logs -f app-name

# Remove image
docker rmi app-name

# Clean up unused images
docker image prune -a
```

---

## 🔐 SSH Commands

```bash
# Generate SSH key
ssh-keygen -t rsa -b 4096 -f ~/.ssh/deploy_key -N ""

# Copy key to server
ssh-copy-id -i ~/.ssh/deploy_key.pub root@SERVER_IP

# SSH into server
ssh root@SERVER_IP

# SSH with specific key
ssh -i ~/.ssh/deploy_key root@SERVER_IP

# View public key
cat ~/.ssh/deploy_key.pub

# View private key
cat ~/.ssh/deploy_key
```

---

## 🌐 Nginx Commands

```bash
# Test configuration
nginx -t

# Reload configuration
systemctl reload nginx

# Restart Nginx
systemctl restart nginx

# Check status
systemctl status nginx

# View error logs
tail -f /var/log/nginx/error.log

# View access logs
tail -f /var/log/nginx/access.log
```

---

## 🔒 SSL/Certbot Commands

```bash
# Get SSL certificate
certbot --nginx -d yourdomain.com

# Renew certificates
certbot renew

# Test renewal (dry run)
certbot renew --dry-run

# List certificates
certbot certificates

# Revoke certificate
certbot revoke --cert-name yourdomain.com
```

---

## 🔥 Firewall Commands (UFW)

```bash
# Check status
ufw status

# Enable firewall
ufw enable

# Allow port
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp

# Deny port
ufw deny 3000/tcp

# Delete rule
ufw delete allow 3000/tcp

# Disable firewall
ufw disable
```

---

## 📦 Package Management (Ubuntu)

```bash
# Update package list
apt update

# Upgrade packages
apt upgrade

# Install package
apt install -y package-name

# Remove package
apt remove package-name

# Search for package
apt search package-name
```

---

## 🔍 Debugging Commands

```bash
# Check what's using a port
lsof -i :3000
netstat -tulpn | grep 3000

# Check DNS resolution
ping domain.com
nslookup domain.com
dig domain.com

# Check if port is accessible externally
curl -I http://domain.com

# Test localhost
curl http://localhost:3000

# View system resources
htop
df -h  # Disk space
free -h  # Memory
```

---

## 🔄 Git Commands

```bash
# Initialize repo
git init

# Add all files
git add .

# Commit
git commit -m "message"

# Push to GitHub
git push

# Check status
git status

# View remote
git remote -v

# Add remote
git remote add origin https://github.com/user/repo.git

# Change branch
git checkout main
```

---

## 📊 Server Management

```bash
# Check running processes
ps aux | grep node
ps aux | grep docker

# Kill process by PID
kill -9 PID

# Check disk usage
df -h

# Check memory usage
free -h

# Check system info
uname -a

# Reboot server
reboot

# Shutdown server
shutdown -h now
```

---

## 🚨 Emergency Commands

```bash
# Stop all Docker containers
docker stop $(docker ps -q)

# Remove all Docker containers
docker rm $(docker ps -aq)

# Remove all Docker images
docker rmi $(docker images -q)

# Restart server
reboot

# Check last 50 lines of logs
tail -n 50 /var/log/nginx/error.log

# Free up disk space
docker system prune -a
apt autoremove
```

---

## 📝 Useful File Locations

```bash
# Nginx configs
/etc/nginx/nginx.conf
/etc/nginx/sites-available/
/etc/nginx/sites-enabled/

# Nginx logs
/var/log/nginx/access.log
/var/log/nginx/error.log

# SSL certificates
/etc/letsencrypt/live/yourdomain.com/

# Docker data
/var/lib/docker/

# System logs
/var/log/syslog
```

---

## 💡 Tips

- Always use `-t` flag to test Nginx config before reloading
- Use `docker logs -f` to debug container issues
- Keep SSH keys secure and never commit them to Git
- Add `.env` files to `.gitignore`
- Use `--restart unless-stopped` for production containers
- Set up automatic SSL renewal: `certbot renew` runs automatically
- Monitor disk space: Docker images can fill up disk
- Use `docker system prune` regularly to clean up

---

**Bookmark this for quick reference! 🔖**

