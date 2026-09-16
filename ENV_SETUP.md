# Environment Setup Guide

## Frontend (.env)

Create a `.env` file in the project root for local development:

```env
VITE_API_URL=http://localhost:8000/api
```

For production, create `.env.production`:

```env
VITE_API_URL=https://apiwcbt.nirvixtech.com/api
```

### Build for production

```bash
npm run build
```

Upload the `dist/` folder contents to cPanel `public_html`.

---

## Backend (.env)

Create a `.env` file in your Django project root:

```env
# Django
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=apiwcbt.nirvixtech.com,localhost

# Database
DB_NAME=everestw_wcbt_db
DB_USER=everestw_wcbt
DB_PASSWORD=your-db-password
DB_HOST=127.0.0.1
DB_PORT=3306

# CORS (comma-separated origins)
CORS_ALLOWED_ORIGINS=https://apiwcbt.nirvixtech.com,https://cms.whitehouseeducation.edu.np

# Email (Resend)
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=your-email@example.com
```

### Variable Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_KEY` | Yes | Django secret key for cryptographic signing |
| `DEBUG` | Yes | `True` for development, `False` for production |
| `ALLOWED_HOSTS` | Yes | Comma-separated domains Django serves |
| `DB_NAME` | Yes | MySQL database name |
| `DB_USER` | Yes | MySQL database user |
| `DB_PASSWORD` | Yes | MySQL database password |
| `DB_HOST` | Yes | Database host (use `127.0.0.1` for local) |
| `DB_PORT` | Yes | Database port (default `3306`) |
| `CORS_ALLOWED_ORIGINS` | Yes | Comma-separated frontend domains |
| `RESEND_API_KEY` | No | Resend email service API key |
| `RESEND_FROM_EMAIL` | No | Sender email address |

---

## Django settings.py

Add these to your `settings.py`:

```python
import os
from pathlib import Path

# --- INSTALLED_APPS ---
INSTALLED_APPS = [
    # ... your existing apps
    'corsheaders',
    'rest_framework',
]

# --- MIDDLEWARE (CorsMiddleware must be first) ---
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    # ... rest of your middleware
]

# --- CORS ---
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',')
    if origin.strip()
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# --- CamelCase serialization ---
REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": (
        "djangorestframework_camel_case.render.CamelCaseJSONRenderer",
    ),
    "DEFAULT_PARSER_CLASSES": (
        "djangorestframework_camel_case.parser.CamelCaseJSONParser",
    ),
}

# --- Database ---
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST', '127.0.0.1'),
        'PORT': os.environ.get('DB_PORT', '3306'),
    }
}
```

---

## Install required packages

```bash
pip install django djangorestframework django-cors-headers djangorestframework-camel-case
```

---

## Verification

After setup, verify everything works:

1. **Backend runs**: Visit `https://apiwcbt.nirvixtech.com/api/` — should not return 500 error
2. **CORS works**: Open browser DevTools → Network tab → login request → response should have `Access-Control-Allow-Origin` header
3. **Frontend connects**: Login from `https://cms.whitehouseeducation.edu.np` should succeed without CORS errors
