# College Management System — Backend Documentation

## Overview

Production-ready Django REST Framework backend for WhiteHouse College of Business & Technology (WCBT).

## Tech Stack

- Python 3.10+
- Django 5.2
- Django REST Framework
- MySQL (Laragon)
- JWT (SimpleJWT)
- bcrypt (password hashing)
- Resend (email/OTP)
- drf-spectacular (API docs)
- djangorestframework-camel-case (camelCase serialization)

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
│   ├── authentication/        # User model, auth endpoints
│   │   ├── api/
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── permissions.py
│   │   ├── management/commands/
│   │   │   └── createsuperadmin.py
│   │   ├── models.py
│   │   ├── services.py
│   │   └── admin.py
│   ├── email_verification/    # OTP + password reset
│   │   ├── api/
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── urls.py
│   │   ├── models.py
│   │   └── services.py
│   ├── programs/              # Academic programs
│   │   ├── api/
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── urls.py
│   │   └── models.py
│   └── common/                # Shared utilities
│       ├── responses.py
│       ├── exceptions.py
│       ├── pagination.py
│       └── validators.py
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_otp.py
│   └── test_programs.py
├── .env
├── .env.example
├── requirements.txt
├── pyproject.toml
├── pytest.ini
└── README.md
```

---

## Phases Completed

### Phase 1: Foundation

- Split settings (base/development/production)
- MySQL configuration (Laragon)
- DRF, JWT, CORS, drf-spectacular configured
- Common utilities (responses, exceptions, pagination, validators)

### Phase 2: Custom User Model

- `AbstractBaseUser` + `PermissionsMixin`
- Fields: id (UUID), email, username, first_name, last_name, role, is_active, is_staff, created_at, updated_at
- Roles: `super_admin`, `admin`, `staff`
- bcrypt password hashing
- Custom UserManager
- Admin registration
- Management command: `createsuperadmin`

### Phase 3: Authentication APIs

- POST `/api/auth/signup/` — Register
- POST `/api/auth/login/` — Login (email or username via `identifier`)
- POST `/api/auth/refresh/` — Refresh JWT
- POST `/api/auth/logout/` — Blacklist token
- GET `/api/auth/me/` — Current user (login shape)
- GET `/api/auth/profile/` — Full profile

### Phase 4: OTP Verification (Resend)

- POST `/api/auth/send-otp/` — Send 6-digit OTP
- POST `/api/auth/verify-otp/` — Verify email OTP
- POST `/api/auth/forgot-password/` — Request password reset
- POST `/api/auth/reset-password/` — Reset with OTP
- OTP expires in 5 minutes, auto-invalidates previous
- Emails sent via Resend API

### Phase 5: Programs App

- GET/POST `/api/programs/` — List, create
- GET/PATCH/DELETE `/api/programs/{id}/` — Detail, update, delete
- UUID PKs, unique case-insensitive code
- Level enum: Bachelor, Master, Diploma, Certificate
- Status enum: Active, Inactive

### Phase 6: Seed SuperAdmin

- `python manage.py createsuperadmin`
- Default: admin@WCBTcollege.com / Admin@1234
- Supports --email, --password, --username, --first-name, --last-name

---

## API Conventions

| Convention | Value |
|------------|-------|
| Serialization | camelCase via djangorestframework-camel-case |
| Primary keys | UUID |
| Date format | ISO-8601 |
| Response envelope | `{ success, message, data/errors }` |
| Error format | `{ detail: "..." }` or field-keyed `{ field: ["error"] }` |
| Auth header | `Authorization: Bearer <token>` |
| Password hashing | bcrypt |

## Role Hierarchy

| Role | Permissions |
|------|-------------|
| `super_admin` | Everything + staff management + delete programs |
| `admin` | Most features + add/edit programs |
| `staff` | View-only for most features |

## Enum Values

| Type | Values |
|------|--------|
| Role | `super_admin`, `admin`, `staff` |
| Program level | `Bachelor`, `Master`, `Diploma`, `Certificate` |
| Program status | `Active`, `Inactive` |
| Staff status | `Active`, `Inactive`, `On Leave` |
| Employment type | `Full-time`, `Part-time`, `Visiting` |
| Gender | `Male`, `Female`, `Other` |
| Admission stage | `Applied`, `Document Verification`, `Test/Interview`, `Result`, `Enrolled`, `Rejected` |
| Notification category | `General`, `Academic`, `Admission`, `Urgent` |
| Notification priority | `Normal`, `High`, `Urgent` |
| Notification status | `Draft`, `Published`, `Archived` |

---

## Test Results

| Phase | Tests |
|-------|-------|
| Auth (signup, login, logout, profile, refresh) | 20 |
| OTP (send, verify, forgot password, reset) | 14 |
| Programs (CRUD + validation) | 15 |
| **Total** | **49** |

---

## Pending Phases

- [ ] Staff app (CRUD + activity + salary gate)
- [ ] Admissions app (CRUD + bulk + trend + convert)
- [ ] Notifications app (CRUD + publish + bulk ops)
- [ ] Settings app (single document resource)
- [ ] File upload endpoint
- [ ] Dashboard summary endpoint
- [ ] Permission classes (HasPortalPermission)
- [ ] Comprehensive tests for all new endpoints
