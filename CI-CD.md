# CI/CD Setup Guide — GitHub Actions + cPanel FTP

## Target: https://api.whitehouseeducation.edu.np/

---

## Overview

```
Push to `api` branch → GitHub Actions → FTP upload → Site updated
```

- **Branch:** `api` (only this branch triggers deployment)
- **Method:** FTP upload via GitHub Actions
- **Hosting:** cPanel with Passenger (Python App)
- **Database:** New MySQL database on same cPanel server

---

## Part 1: cPanel Setup (One-Time Manual Steps)

### Step 1: Create Subdomain

1. Log in to **cPanel**
2. Go to **Domains** (or **Subdomains**)
3. Click **Create A New Domain** (or **Create Subdomain**)
4. Fill in:
   - Domain: `api.whitehouseeducation.edu.np`
   - Document Root: `public_html/api.whitehouse` (or as needed)
5. Click **Create**

---

### Step 2: Create MySQL Database

1. Go to **cPanel → MySQL Databases**
2. **Create Database:**
   - Name: `nirvixco_whitehouse` (or your preferred name)
   - Click **Create Database**
3. **Create User:**
   - Username: `nirvixco_whuser` (or your preferred name)
   - Password: (generate a strong password — **save this!**)
   - Click **Create User**
4. **Add User to Database:**
   - Select the user and database you just created
   - Click **Add**
   - Check **ALL PRIVILEGES**
   - Click **Make Changes**
5. **Note down:**
   - DB Name: `nirvixco_whitehouse`
   - DB User: `nirvixco_whuser`
   - DB Password: (the one you set)
   - DB Host: `127.0.0.1`

---

### Step 3: Setup Python App

1. Go to **cPanel → Setup Python App** (or **Python Selector**)
2. Click **Create Application**
3. Fill in:
   - Python version: **3.10**
   - Application root: `api.whitehouse` (match the subdomain document root)
   - Application URL: `api.whitehouseeducation.edu.np`
   - Application startup file: `passenger_wsgi.py`
   - Application entry point: `application`
4. Click **Create**

---

### Step 4: First Deployment (Manual)

> GitHub Actions can't run migrations because the database is on `127.0.0.1` of the cPanel server. So the **first deploy is manual**.

1. Go to **cPanel → File Manager**
2. Navigate to `public_html/api.whitehouse/`
3. **Upload all project files** (excluding `.venv/`, `__pycache__/`, `.git/`, `tests/`)
4. Go back to **cPanel → Setup Python App**
5. Open the terminal for your app (or use **cPanel → Terminal** if available)
6. Run:
   ```bash
   cd ~/api.whitehouse
   source venv/bin/activate
   pip install -r requirements_production.txt
   python manage.py migrate
   python manage.py collectstatic --noinput
   ```

> **After this first deploy, all future updates are automatic** — just push to the `api` branch.

---

### Step 5: Create FTP Account

1. Go to **cPanel → FTP Accounts**
2. Fill in:
   - Log In: `github-deploy` (or your preferred name)
   - Password: (generate a strong password — **save this!**)
   - Directory: `/public_html/api.whitehouse` (match the subdomain root)
3. Click **Create FTP Account**
4. **Note down:**
   - FTP Host: your server IP (or `whitehouseeducation.edu.np`)
   - FTP Username: `github-deploy@whitehouseeducation.edu.np` (or `github-deploy`)
   - FTP Password: (the one you set)

---

### Step 6: Create .env.production File on Server

1. Go to **cPanel → File Manager**
2. Navigate to `public_html/api.whitehouse/`
3. Create a new file called `.env.production`
4. Paste the following (fill in real values):

```env
SECRET_KEY=your-generated-secret-key-here
DEBUG=False
ALLOWED_HOSTS=api.whitehouseeducation.edu.np

DB_NAME=nirvixco_whitehouse
DB_USER=nirvixco_whuser
DB_PASSWORD=your-actual-db-password
DB_HOST=127.0.0.1
DB_PORT=3306

CORS_ALLOWED_ORIGINS=https://api.whitehouseeducation.edu.np

RESEND_API_KEY=your-resend-key
RESEND_FROM_EMAIL=noreply@whitehouseeducation.edu.np
```

---

## Part 2: GitHub Setup (One-Time Manual Steps)

### Step 1: Add Repository Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each:

| Secret Name | Value |
|-------------|-------|
| `FTP_HOST` | Your server IP (e.g. `192.168.1.1`) or `whitehouseeducation.edu.np` |
| `FTP_USERNAME` | `github-deploy@whitehouseeducation.edu.np` (or just `github-deploy`) |
| `FTP_PASSWORD` | The FTP password you created |
| `PROD_SECRET_KEY` | A random secret key (run `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` locally) |
| `PROD_DB_NAME` | Your MySQL database name (e.g. `nirvixco_whitehouse`) |
| `PROD_DB_USER` | Your MySQL username (e.g. `nirvixco_whuser`) |
| `PROD_DB_PASSWORD` | The MySQL password you set |
| `PROD_DB_HOST` | `127.0.0.1` |
| `PROD_RESEND_API_KEY` | Your Resend API key |
| `PROD_RESEND_FROM_EMAIL` | `noreply@whitehouseeducation.edu.np` |
| `CORS_ALLOWED_ORIGINS` | `https://api.whitehouseeducation.edu.np` |

---

## Part 3: How the Workflow Works

### File: `.github/workflows/deploy.yml`

When you push to the `api` branch:

1. **Checkout code** — downloads the latest code
2. **Setup Python 3.10** — installs Python
3. **Install dependencies** — runs `pip install -r requirements_production.txt`
4. **Create .env.production** — injects secrets from GitHub
5. **Collect static files** — runs `python manage.py collectstatic --noinput`
6. **Upload via FTP** — sends all files to cPanel server
7. **Done!** — site is live at `api.whitehouseeducation.edu.np`

> **Note:** Migrations are NOT run by GitHub Actions. If you add new models/migrations, you need to run them manually via cPanel terminal:
> ```bash
> cd ~/api.whitehouse
> source venv/bin/activate
> python manage.py migrate
> ```

### What Gets Deployed

```
✅ apps/           — All Django apps
✅ config/         — Settings, URLs, WSGI
✅ manage.py       — Django management
✅ passenger_wsgi.py — WSGI entry point
✅ requirements_production.txt
✅ staticfiles/    — Collected static files
✅ api.md, DEPLOYMENT.md, CI-CD.md
```

### What Gets Excluded

```
❌ .git/
❌ .venv/, venv/
❌ __pycache__/
❌ tests/
❌ .env (server has its own)
❌ media/ (user uploads stay on server)
❌ .pytest_cache/
❌ .ruff_cache/
❌ node_modules/
```

---

## Part 4: Deployment Workflow

### Daily Development

```bash
# Make changes locally
git add .
git commit -m "your changes"

# Push to api branch to deploy
git push origin api
```

### What Happens

1. Push triggers GitHub Actions
2. Workflow runs (~1-2 minutes)
3. Files uploaded to server via FTP
4. Site is live!

### Check Deployment Status

1. Go to your GitHub repository
2. Click **Actions** tab
3. You'll see the workflow run with status:
   - 🟢 Green = success
   - 🔴 Red = failed (check logs)

---

## Part 5: First Deployment Checklist

After setting up everything:

- [ ] cPanel subdomain created
- [ ] MySQL database + user created
- [ ] Python App configured (entry point: `application`)
- [ ] **First deploy: upload code via File Manager**
- [ ] **First deploy: run `pip install`, `migrate`, `collectstatic` via terminal**
- [ ] FTP account created
- [ ] `.env.production` file created on server
- [ ] GitHub secrets added
- [ ] `api` branch created and pushed
- [ ] Test: `GET https://api.whitehouseeducation.edu.np/api/auth/login/`

---

## Troubleshooting

### Workflow Fails at FTP Step
- Check FTP credentials in GitHub Secrets
- Ensure FTP directory matches the subdomain root
- Verify FTP account is active in cPanel

### 500 Error After Deploy
- Check `.env.production` file exists on server with correct values
- Verify MySQL database name, user, and password match
- Check error logs in cPanel → **Error Logs**

### Static Files Not Loading
- Ensure `staticfiles/` was uploaded
- Check `STATIC_ROOT` in settings matches server path

### CORS Errors
- Update `CORS_ALLOWED_ORIGINS` in `.env` to include your frontend URL
- Include both `https://whitehouseeducation.edu.np` and `https://www.whitehouseeducation.edu.np`

### Application Won't Start
- Verify entry point is `application` in cPanel Python App settings
- Check `passenger_wsgi.py` exists in the application root
- Verify Python version is 3.10

### New Migration Not Applied
- GitHub Actions doesn't run migrations
- Run manually via cPanel terminal:
  ```bash
  cd ~/api.whitehouse
  source venv/bin/activate
  python manage.py migrate
  ```

---

## Quick Reference

| Item | Value |
|------|-------|
| Site URL | `https://api.whitehouseeducation.edu.np/` |
| Swagger Docs | `https://api.whitehouseeducation.edu.np/api/docs/` |
| Admin Panel | `https://api.whitehouseeducation.edu.np/admin/` |
| Deploy Branch | `api` |
| Deploy Method | FTP via GitHub Actions |
| Python Version | 3.10 |
| Entry Point | `application` |
