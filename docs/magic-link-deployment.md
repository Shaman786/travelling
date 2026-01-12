# Magic Link Production Deployment Guide

## Prerequisites Checklist

- [ ] Appwrite server running at `192.142.24.54`
- [ ] Web Platform registered with hostname `192.142.24.54`
- [ ] SMTP configured in Appwrite (Resend, SendGrid, or custom)

---

## Step 1: Create Redirect Page on Server

The Magic Link email contains an HTTP URL. This page redirects users to your app.

**SSH into your server:**

```bash
ssh user@192.142.24.54
```

**Create the redirect page:**

```bash
# Create directory (adjust path based on your web server)
sudo mkdir -p /var/www/html

# Create the redirect page
sudo tee /var/www/html/login-callback.html > /dev/null << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Redirecting to App...</title>
  <style>
    body { font-family: sans-serif; text-align: center; padding: 50px; }
    .spinner { display: inline-block; width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #007AFF; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <h2>Opening App...</h2>
  <p>If the app doesn't open, <a id="fallback" href="#">click here</a></p>
  <script>
    // Get query params from current URL
    const params = window.location.search;
    // Build deep link URL
    const deepLink = "travelling://login-callback" + params;
    // Update fallback link
    document.getElementById('fallback').href = deepLink;
    // Redirect to app
    window.location.href = deepLink;
  </script>
</body>
</html>
EOF
```

**Configure Nginx to serve it:**

```bash
# If using Nginx, add this to your config
sudo tee /etc/nginx/sites-available/redirect << 'EOF'
server {
    listen 80;
    server_name 192.142.24.54;
    root /var/www/html;

    location /login-callback {
        try_files /login-callback.html =404;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/redirect /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## Step 2: Appwrite Platform Registration

1. Go to **Appwrite Console** → **Overview** → **Platforms**
2. Ensure these platforms exist:
   - **Android**: `com.travels.travelling`
   - **iOS**: `com.travels.travelling`
   - **Web**: `192.142.24.54`

---

## Step 3: Appwrite Email Template

Go to **Appwrite Console** → **Auth** → **Templates** → **Magic URL** → **Message**

Paste this HTML:

```html
<p>Hello,</p>
<p>Click the button below to sign in to <b>travelling</b>:</p>
<p style="text-align: center; margin: 32px 0;">
  <a
    href="{{redirect}}"
    style="display: inline-block; padding: 12px 24px; color: #fff; background: #007AFF; border-radius: 4px; text-decoration: none; font-weight: bold;"
  >
    Sign In
  </a>
</p>
<p>Or copy this link: {{redirect}}</p>
<p>Thanks,<br />The travelling team</p>
```

---

## Step 4: Build APK

```bash
npx expo prebuild
cd android
./gradlew assembleRelease
```

APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

---

## Verification Checklist

- [ ] Redirect page accessible at `http://192.142.24.54/login-callback`
- [ ] Magic Link email sends successfully
- [ ] Clicking email link opens browser → redirects to app
- [ ] App receives `userId` and `secret` parameters
- [ ] Session is created successfully

---

## Troubleshooting

| Error            | Solution                                             |
| ---------------- | ---------------------------------------------------- |
| "Invalid URI"    | Ensure `192.142.24.54` is registered as Web Platform |
| Email not sent   | Check SMTP config in Appwrite `.env`                 |
| App doesn't open | Check `scheme: "travelling"` in `app.json`           |
| 404 on redirect  | Ensure Nginx is serving `/login-callback`            |
