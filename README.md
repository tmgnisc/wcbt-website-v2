# College Management System — Backend

Production-ready Django REST Framework backend for managing college operations.

## Tech Stack

- Python 3.13+
- Django 5+
- Django REST Framework
- MySQL (Laragon)
- JWT (SimpleJWT)
- bcrypt (password hashing)
- drf-spectacular (API docs)
- Pytest

## Project Structure

```
college_backend/
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
├── apps/
│   ├── authentication/
│   │   ├── api/
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── permissions.py
│   │   ├── models.py
│   │   ├── services.py
│   │   └── admin.py
│   └── common/
│       ├── responses.py
│       ├── exceptions.py
│       ├── pagination.py
│       └── validators.py
├── tests/
│   ├── conftest.py
│   └── test_auth.py
├── .env
├── .env.example
├── requirements.txt
├── pyproject.toml
├── pytest.ini
└── manage.py
```

## Setup

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd college_backend
python -m venv .venv
.venv\Scripts\activate      # Windows
pip install -r requirements.txt
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```env
SECRET_KEY=your-long-random-key
DEBUG=True

DB_NAME=college_db
DB_USER=root
DB_PASSWORD=
DB_HOST=127.0.0.1
DB_PORT=3306

ALLOWED_HOSTS=127.0.0.1,localhost
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### 3. Create MySQL database

In Laragon or MySQL CLI:

```sql
CREATE DATABASE college_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Run migrations

```bash
python manage.py migrate
```

### 5. Create superadmin

```bash
python manage.py createsuperadmin
```

### 6. Start the server

```bash
python manage.py runserver
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup/` | No | Register a new account |
| POST | `/api/auth/login/` | No | Login and get JWT tokens |
| POST | `/api/auth/token/refresh/` | No | Refresh access token |
| GET | `/api/auth/profile/` | Yes | Get current user profile |
| POST | `/api/auth/logout/` | Yes | Blacklist refresh token |

## API Documentation

| URL | Description |
|-----|-------------|
| `/api/docs/` | Swagger UI |
| `/api/redoc/` | ReDoc |
| `/api/schema/` | OpenAPI schema (JSON/YAML) |

## Roles

| Role | Permissions |
|------|-------------|
| **Staff** | Dashboard, notices, events, admissions, student records, departments, reports, profile |
| **SuperAdmin** | Everything Staff can do + manage staff accounts (CRUD, toggle status, reset password, promote/demote) |

## Testing

```bash
python -m pytest -v
```

## Code Quality

```bash
black .           # format
ruff check .      # lint
```

## License

MIT
