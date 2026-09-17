# Deployment Guide

## Deployments

| Subdomain | URL | Method |
|-----------|-----|--------|
| apiwcbt | https://apiwcbt.nirvixtech.com/ | Manual cPanel upload |
| whitehouse | https://api.whitehouseeducation.edu.np/ | **CI/CD via GitHub Actions** |

> For the whitehouse subdomain, see **[CI-CD.md](CI-CD.md)** for full setup instructions.

---

## Manual Deployment (apiwcbt)

### Target: https://apiwcbt.nirvixtech.com/

---

## Pre-Deployment Checklist

- [x] `passenger_wsgi.py` created
- [x] `config/wsgi.py` updated for production
- [x] `requirements_production.txt` created
- [x] `.env.production` created (fill in DB credentials)
- [x] `config/urls.py` updated for media files
- [x] `config/settings/production.py` configured

---

## Step 1: Create MySQL Database in cPanel

1. Go to **cPanel → MySQL Databases**
2. Create database: `nirvixco_wcbt`
3. Create user: `nirvixco_wcbtuser` (set strong password)
4. Add user to database → **All Privileges**
5. Note down:
   - DB Name: `nirvixco_wcbt`
   - DB User: `nirvixco_wcbtuser`
   - DB Password: (the one you set)
   - DB Host: `127.0.0.1`

---

## Step 2: Upload Project Files

### Via File Manager:
1. Go to **cPanel → File Manager**
2. Navigate to `public_html/apiwcbt/` (or create this folder)
3. Upload entire project:
   - Click **Upload** → Select all project files
   - **Exclude**: `.venv/`, `__pycache__/`, `.git/`, `tests/`, `pytest.ini`, `pyproject.toml`

### Upload Structure:
```
public_html/apiwcbt/
├── apps/
├── config/
├── media/
├── staticfiles/
├── manage.py
├── passenger_wsgi.py
├── requirements_production.txt
├── .env (rename from .env.production)
└── ...
```

---

## Step 3: Setup Python App in cPanel

1. Go to **cPanel → Setup Python App**
2. Click **Create Application**
3. Fill in:
   - Python version: **3.10**
   - Application root: **apiwcbt**
   - Application URL: **apiwcbt.nirvixtech.com**
   - Application startup file: **passenger_wsgi.py**
   - Application entry point: **app**
4. Click **Create**

---

## Step 4: Update .env with Real Credentials

Edit `.env` file with your actual database credentials:

```env
SECRET_KEY=your-generated-secret-key-here
DEBUG=False
ALLOWED_HOSTS=apiwcbt.nirvixtech.com

DB_NAME=nirvixco_wcbt
DB_USER=nirvixco_wcbtuser
DB_PASSWORD=your-actual-db-password
DB_HOST=127.0.0.1
DB_PORT=3306

CORS_ALLOWED_ORIGINS=https://apiwcbt.nirvixtech.com

RESEND_API_KEY=your-resend-key
RESEND_FROM_EMAIL=noreply@nirvixtech.com
```

---

## Step 5: Install Dependencies

In cPanel Python App terminal or SSH:

```bash
cd ~/apiwcbt
source venv/bin/activate
pip install -r requirements_production.txt
```

---

## Step 6: Run Migrations & Setup

```bash
cd ~/apiwcbt
source venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperadmin
```

Default superadmin:
- Email: `admin@WCBTcollege.com`
- Password: `Admin@1234`

---

## Step 7: Test Deployment

| Test | URL |
|------|-----|
| Swagger Docs | https://apiwcbt.nirvixtech.com/api/docs/ |
| Admin Panel | https://apiwcbt.nirvixtech.com/admin/ |
| Login | POST https://apiwcbt.nirvixtech.com/api/auth/login/ |
| Dashboard | GET https://apiwcbt.nirvixtech.com/api/dashboard/ |

### Test Login:
```json
POST /api/auth/login/
{
  "identifier": "admin@WCBTcollege.com",
  "password": "Admin@1234"
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 500 Error | Check `.env` credentials, check MySQL database exists |
| Static files not loading | Run `python manage.py collectstatic --noinput` |
| CORS errors | Ensure `CORS_ALLOWED_ORIGINS` matches your frontend URL |
| Media files not serving | Check `MEDIA_ROOT` permissions (755) |
| App won't start | Check passenger_wsgi.py entry point is `app` |
