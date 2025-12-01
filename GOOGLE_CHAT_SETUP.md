# Google Chat Notifications Setup Guide

This guide shows you how to set up deployment notifications in Google Chat for your QA/test team.

---

## 📋 What You'll Get

After setup, your team will receive notifications like this:

**When deployment starts:**
```
🚀 TESTING Deployment Started
📦 App: Todo App
👤 By: daipham1118
🌿 Branch: testing
💬 Commit: Fix login button styling
⏱️ Started at: 2025-12-01 14:30:00 UTC
```

**When deployment succeeds:**
```
✅ TESTING Deployment Successful!
📦 App: Todo App
👤 By: daipham1118
🌐 URL: http://192.168.1.100:3002
🔗 Commit: Fix login button styling
⏱️ Completed at: 2025-12-01 14:33:00 UTC

🧪 Ready for QA testing!
```

**When deployment fails:**
```
❌ TESTING Deployment Failed!
📦 App: Todo App
👤 By: daipham1118
🌿 Branch: testing
🔗 Check logs: https://github.com/...
⏱️ Failed at: 2025-12-01 14:32:00 UTC
```

---

## 🚀 Step-by-Step Setup (5 minutes)

### Step 1: Create a Google Chat Space (if needed)

1. Open **Google Chat** (https://chat.google.com)
2. Click **+** next to "Spaces"
3. Create a new space:
   - Name: `QA Deployments` (or whatever you prefer)
   - Add your QA team members
4. Click **Create**

**Or** use an existing space where you want notifications.

---

### Step 2: Create a Webhook in Google Chat

1. Open the Google Chat space
2. Click the **space name** at the top
3. Select **Apps & integrations**
4. Click **Webhooks**
5. Click **Add webhook**
6. Fill in:
   - **Name:** `Deployment Bot`
   - **Avatar URL:** (optional, leave blank)
7. Click **Save**
8. **Copy the webhook URL** 
   - It looks like: `https://chat.googleapis.com/v1/spaces/AAAAxxxxxx/messages?key=...`
   - ⚠️ **Keep this URL secret!** Anyone with it can post to your chat

---

### Step 3: Add Webhook to GitHub Secrets

1. Go to your GitHub repository: https://github.com/YOUR_USERNAME/YOUR_REPO
2. Click **Settings** (top menu)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret** (green button)
5. Enter:
   - **Name:** `GOOGLE_CHAT_WEBHOOK`
   - **Secret:** Paste the webhook URL you copied
6. Click **Add secret**

---

### Step 4: Test It!

**That's it! The workflows are already updated.**

To test:

1. Make a small change to your code (any file)
2. Commit and push to `dev` or `testing` branch:
   ```bash
   git add .
   git commit -m "Test Google Chat notifications"
   git push
   ```
3. Watch your Google Chat space - you should see notifications! 🎉

---

## 🎯 What's Configured

### For DEV Environment (dev branch):
- ✅ Start notification when deployment begins
- ✅ Success notification with URL: `http://YOUR_IP:3001`
- ✅ Failure notification with link to logs

### For TESTING Environment (testing branch):
- ✅ Start notification when deployment begins
- ✅ Success notification with URL: `http://YOUR_IP:3002`
- ✅ Failure notification with link to logs

---

## 🔧 Customization Options

### Change the App Name

Edit `.github/workflows/deploy-dev.yml` and `.github/workflows/deploy-testing.yml`:

```yaml
"text": "🚀 *DEV Deployment Started*\n📦 App: Todo App\n..."
                                                    ^^^^^^^^
                                                    Change this
```

### Add More Information

You can add more fields to the notification. Available variables:

- `${{ github.actor }}` - Who pushed the code
- `${{ github.ref_name }}` - Branch name
- `${{ github.event.head_commit.message }}` - Commit message
- `${{ github.sha }}` - Full commit SHA
- `${{ github.repository }}` - Repo name
- `${{ secrets.DO_HOST }}` - Server IP
- `$(date -u +"%Y-%m-%d %H:%M:%S UTC")` - Current timestamp

### Example: Add Build Duration

Add this to the success notification:

```yaml
"text": "✅ *DEV Deployment Successful!*\n📦 App: Todo App\n👤 By: ${{ github.actor }}\n🌐 URL: http://${{ secrets.DO_HOST }}:3001\n⏱️ Duration: ${{ job.status }}\n\n🧪 Ready for testing!"
```

---

## 📱 Multiple Chat Rooms

### For Different Teams

If you want different notifications for different teams:

**Option 1: Multiple Webhooks**

Create separate webhooks and secrets:
- `GOOGLE_CHAT_WEBHOOK_DEV` - for dev team
- `GOOGLE_CHAT_WEBHOOK_QA` - for QA team

Then use them in different workflows:

```yaml
# In deploy-dev.yml
curl -X POST '${{ secrets.GOOGLE_CHAT_WEBHOOK_DEV }}' ...

# In deploy-testing.yml
curl -X POST '${{ secrets.GOOGLE_CHAT_WEBHOOK_QA }}' ...
```

**Option 2: Mention Specific People**

Add mentions in notifications:

```yaml
"text": "✅ *TESTING Deployment Successful!*\n<users/all> Ready for testing!\n..."
```

Or mention specific users:
```yaml
"text": "✅ Deployment done! <users/123456789> please test"
```

---

## 🎨 Advanced: Rich Cards (Optional)

For fancier notifications with buttons, use card format:

```yaml
- name: ✅ Notify deployment success (with card)
  if: success()
  run: |
    curl -X POST '${{ secrets.GOOGLE_CHAT_WEBHOOK }}' \
    -H 'Content-Type: application/json' \
    -d '{
      "cards": [{
        "header": {
          "title": "✅ Deployment Successful",
          "subtitle": "Todo App - Testing Environment",
          "imageUrl": "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
        },
        "sections": [{
          "widgets": [
            {
              "keyValue": {
                "topLabel": "Deployed by",
                "content": "${{ github.actor }}"
              }
            },
            {
              "keyValue": {
                "topLabel": "Branch",
                "content": "${{ github.ref_name }}"
              }
            },
            {
              "keyValue": {
                "topLabel": "Commit",
                "content": "${{ github.event.head_commit.message }}"
              }
            },
            {
              "buttons": [
                {
                  "textButton": {
                    "text": "🌐 OPEN APP",
                    "onClick": {
                      "openLink": {
                        "url": "http://${{ secrets.DO_HOST }}:3002"
                      }
                    }
                  }
                },
                {
                  "textButton": {
                    "text": "📋 VIEW LOGS",
                    "onClick": {
                      "openLink": {
                        "url": "https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}"
                      }
                    }
                  }
                }
              ]
            }
          ]
        }]
      }]
    }'
```

This creates a card with:
- Header with app info
- Key-value pairs for details
- Clickable buttons to open app and view logs

---

## 🔕 Disable Notifications Temporarily

If you need to disable notifications without removing the webhook:

**Option 1: Comment out the notification steps**

In your workflow files, add `#` before the notification steps:

```yaml
# - name: 🔔 Notify deployment start
#   if: always()
#   run: |
#     curl -X POST '${{ secrets.GOOGLE_CHAT_WEBHOOK }}' \
```

**Option 2: Remove the secret**

Delete `GOOGLE_CHAT_WEBHOOK` from GitHub secrets. The workflow will still run, but notifications will fail silently.

---

## 🐛 Troubleshooting

### No notifications appearing?

**Check 1: Is the webhook URL correct?**
- Go to GitHub Settings → Secrets
- Update `GOOGLE_CHAT_WEBHOOK` if needed

**Check 2: Is the space still active?**
- Make sure the Google Chat space wasn't deleted
- Regenerate webhook if needed

**Check 3: Check GitHub Actions logs**
- Go to Actions tab in GitHub
- Click on the workflow run
- Look for errors in notification steps

### Notifications show "Failed to fetch"?

- The webhook URL might be expired
- Regenerate a new webhook in Google Chat
- Update the GitHub secret

### Want to test without deploying?

Create a test workflow `.github/workflows/test-notification.yml`:

```yaml
name: Test Notification

on:
  workflow_dispatch:  # Manual trigger

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Send test notification
        run: |
          curl -X POST '${{ secrets.GOOGLE_CHAT_WEBHOOK }}' \
          -H 'Content-Type: application/json' \
          -d '{
            "text": "🧪 *Test Notification*\nIf you see this, webhooks are working! ✅"
          }'
```

Then go to Actions tab → Test Notification → Run workflow

---

## 📊 Summary

**What you did:**
1. ✅ Created Google Chat webhook (2 min)
2. ✅ Added to GitHub secrets (1 min)
3. ✅ Workflows already updated (0 min)
4. ✅ Tested it (1 min)

**What happens now:**
- Every push to `dev` → Notifications in Google Chat
- Every push to `testing` → Notifications in Google Chat
- Your QA team knows exactly when to test
- No more "Is it deployed yet?" questions! 🎉

---

## 🚀 Next Steps

- [ ] Test a deployment and verify notifications work
- [ ] Ask QA team for feedback on notification format
- [ ] Consider adding @mentions for urgent deployments
- [ ] Set up separate channels for dev vs testing if needed

---

**Questions?** Check the [GitHub Actions documentation](https://docs.github.com/en/actions) or [Google Chat API docs](https://developers.google.com/chat/api).

**Happy deploying! 🎉**

