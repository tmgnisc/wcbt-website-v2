# WCBT College Management System — API Documentation

**Base URL:** `http://localhost:8000/api/`  
**Framework:** Django REST Framework  
**Auth:** JWT (Bearer token)  
**Request/Response Format:** JSON (camelCase)

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Email Verification & Password Reset](#2-email-verification--password-reset)
3. [Staff](#3-staff)
4. [Programs](#4-programs)
5. [Admissions](#5-admissions)
6. [Notifications](#6-notifications)
7. [College Settings](#7-college-settings) (includes Users, Permissions, Catalog)
8. [Files](#8-files)
9. [Dashboard](#9-dashboard)

---

## Quick Reference

### Standard Response Format

All endpoints return responses in this envelope:

```json
{
  "success": true,
  "message": "Description of what happened",
  "data": { ... },
  "errors": { ... }
}
```

### Pagination

List endpoints support pagination via query params:

```
GET /api/staff/?page=1&page_size=20
```

Default `page_size` is 20, max 100.

### Authentication Header

All protected endpoints require:

```
Authorization: Bearer <access_token>
```

### User Roles

| Role | Access Level |
|------|-------------|
| `super_admin` | Full access to everything |
| `admin` | Admin access (staff, admissions, programs, notifications, files, dashboard) |
| `staff` | Read-only access to most portals |

### Request/Response Casing

All JSON keys use **camelCase** (input and output). Example: `first_name` in the database becomes `firstName` in the API.

---

## 1. Authentication

### 1.1 Sign Up

```
POST /api/auth/signup/
```

**Auth:** None (public)

**Request Body:**

```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "SecurePass123",
  "passwordConfirm": "SecurePass123"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Account created successfully",
  "data": null
}
```

---

### 1.2 Login

```
POST /api/auth/login/
```

**Auth:** None (public)

**Request Body:**

```json
{
  "identifier": "user@example.com",
  "password": "SecurePass123",
  "remember": true
}
```

- `identifier` — email or username
- `remember` — optional, default `false`. If `true`, refresh token lasts 7 days

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "admin",
      "avatarUrl": null
    },
    "access": "jwt_access_token",
    "refresh": "jwt_refresh_token"
  }
}
```

**Errors:**
- 400: `"Invalid credentials."`
- 400: `"This account is deactivated."`

---

### 1.3 Logout

```
POST /api/auth/logout/
```

**Auth:** Bearer token required

**Request Body:**

```json
{
  "refresh": "jwt_refresh_token"
}
```

Blacklists the refresh token so it can no longer be used.

**Response (200):**

```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

---

### 1.4 Refresh Token

```
POST /api/auth/refresh/
```

**Auth:** None (public)

**Request Body:**

```json
{
  "refresh": "jwt_refresh_token"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "access": "new_jwt_access_token",
    "refresh": "new_jwt_refresh_token"
  }
}
```

---

### 1.5 Get Current User

```
GET /api/auth/me/
```

**Auth:** Bearer token required

**Response (200):**

```json
{
  "success": true,
  "message": "Request successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "admin",
      "avatarUrl": null
    }
  }
}
```

---

### 1.6 Get Profile Details

```
GET /api/auth/profile/
```

**Auth:** Bearer token required

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "role": "admin",
    "avatarUrl": null,
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

---

## 2. Email Verification & Password Reset

### 2.1 Send OTP

```
POST /api/auth/send-otp/
```

**Auth:** Bearer token required

Sends a 6-digit OTP to the user's email. OTP expires in 5 minutes.

**Response (200):**

```json
{
  "success": true,
  "message": "Verification OTP sent to your email."
}
```

---

### 2.2 Verify OTP

```
POST /api/auth/verify-otp/
```

**Auth:** Bearer token required

**Request Body:**

```json
{
  "otpCode": "123456"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Email verified successfully."
}
```

---

### 2.3 Forgot Password

```
POST /api/auth/forgot-password/
```

**Auth:** None (public)

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

Always returns success to prevent email enumeration.

**Response (200):**

```json
{
  "success": true,
  "message": "If an account exists with this email, a reset code has been sent."
}
```

---

### 2.4 Reset Password

```
POST /api/auth/reset-password/
```

**Auth:** None (public)

**Request Body:**

```json
{
  "email": "user@example.com",
  "otpCode": "123456",
  "newPassword": "NewSecurePass123",
  "newPasswordConfirm": "NewSecurePass123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Password reset successful."
}
```

---

## 3. Staff

**Auth required:** Admin or SuperAdmin for all endpoints

### 3.1 List All Staff

```
GET /api/staff/
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "staffId": "WCBT-S-0001",
      "fullName": "Jane Smith",
      "email": "jane@example.com",
      "gender": "Female",
      "dateOfBirth": "1990-05-15",
      "citizenshipNo": "123456789",
      "address": "123 Main St",
      "phone": "+1234567890",
      "photoUrl": null,
      "department": "Computer Science",
      "designation": "Lecturer",
      "joiningDate": "2024-01-15",
      "employmentType": "Full-time",
      "reportingManagerId": null,
      "salary": 50000,
      "loginEnabled": true,
      "status": "Active",
      "createdAt": "2024-01-15T00:00:00Z",
      "updatedAt": "2024-01-15T00:00:00Z"
    }
  ]
}
```

> **Note:** `salary` field is only visible to SuperAdmin users.

---

### 3.2 Create Staff

```
POST /api/staff/
```

**Request Body:**

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "gender": "Female",
  "dateOfBirth": "1990-05-15",
  "citizenshipNo": "123456789",
  "address": "123 Main St",
  "phone": "+1234567890",
  "department": "Computer Science",
  "designation": "Lecturer",
  "joiningDate": "2024-01-15",
  "employmentType": "Full-time",
  "reportingManagerId": "uuid",
  "salary": 50000,
  "role": "staff"
}
```

**Optional fields:** `gender`, `dateOfBirth`, `citizenshipNo`, `address`, `phone`, `department`, `designation`, `joiningDate`, `employmentType`, `reportingManagerId`, `salary`

**`employmentType` values:** `"Full-time"`, `"Part-time"`, `"Visiting"`

**`role` values:** `"admin"`, `"staff"` (default: `"staff"`)

**Response (201):** Full staff detail object

> **Note:** A User account is auto-created with default password `ChangeMe@123`. Staff ID is auto-generated (WCBT-S-XXXX).

---

### 3.3 Get Staff Detail

```
GET /api/staff/<uuid>/
```

**Response (200):**

```json
{
  "id": "uuid",
  "staffId": "WCBT-S-0001",
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "documents": [],
  "activity": [
    {
      "id": "uuid",
      "action": "Profile created",
      "actor": "Admin User",
      "timestamp": "2024-01-15T00:00:00Z"
    }
  ]
}
```

---

### 3.4 Update Staff

```
PUT /api/staff/<uuid>/
PATCH /api/staff/<uuid>/
```

**Request Body:** Same as create (partial updates supported with PATCH)

**Response (200):** Updated staff detail object

---

### 3.5 Delete Staff

```
DELETE /api/staff/<uuid>/
```

**Response (200):**

```json
{
  "success": true,
  "message": "Staff deactivated successfully"
}
```

> **Note:** This is a soft delete — sets `status` to `"Inactive"` and deactivates the user account.

---

### 3.6 Toggle Staff Status

```
PATCH /api/staff/<uuid>/toggle-status/
```

**Response (200):**

```json
{
  "success": true,
  "message": "Staff activated",
  "data": {
    "loginEnabled": true
  }
}
```

Toggles `loginEnabled` and the user's `is_active` flag.

---

### 3.7 Reset Staff Password (Email)

```
POST /api/staff/<uuid>/reset-password/
```

**Auth:** Admin or SuperAdmin

Sends a password reset OTP email to the staff member's email address.

**Response (200):**

```json
{
  "success": true,
  "message": "Password reset link sent to email"
}
```

---

### 3.8 Set Staff Password (Direct)

```
POST /api/staff/<uuid>/set-password/
```

**Auth:** Admin or SuperAdmin

Admin directly sets a new password for a staff member (no email sent).

**Request Body:**

```json
{
  "newPassword": "NewSecurePass123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

## 4. Programs

**Auth required:** Any authenticated user

### 4.1 List All Programs

```
GET /api/programs/
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "BSC-CS",
      "name": "Bachelor of Science in Computer Science",
      "level": "Bachelor",
      "department": "Computer Science",
      "affiliation": "University of Example",
      "durationYears": 4,
      "semesters": 8,
      "seats": 60,
      "feePerYear": 120000,
      "coordinator": "Dr. Smith",
      "status": "Active",
      "description": "4-year CS program",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**`level` values:** `"Bachelor"`, `"Master"`, `"Diploma"`, `"Certificate"`

---

### 4.2 Create Program

```
POST /api/programs/
```

**Request Body:**

```json
{
  "code": "BSC-CS",
  "name": "Bachelor of Science in Computer Science",
  "level": "Bachelor",
  "department": "Computer Science",
  "affiliation": "University of Example",
  "durationYears": 4,
  "semesters": 8,
  "seats": 60,
  "feePerYear": 120000,
  "coordinator": "Dr. Smith",
  "status": "Active",
  "description": "4-year CS program"
}
```

**Optional fields:** `description`, `status` (default: `"Active"`)

**Response (201):** Full program detail object

---

### 4.3 Get Program Detail

```
GET /api/programs/<uuid>/
```

**Response (200):** Full program detail object

---

### 4.4 Update Program

```
PUT /api/programs/<uuid>/
PATCH /api/programs/<uuid>/
```

**Request Body:** Same as create (partial updates supported with PATCH)

**Response (200):** Updated program detail object

---

### 4.5 Delete Program

```
DELETE /api/programs/<uuid>/
```

**Response (200):**

```json
{
  "success": true,
  "message": "Program deleted successfully"
}
```

> **Note:** This is a hard delete (permanently removes the program).

---

## 5. Admissions

**Auth required:** Admin or SuperAdmin for all endpoints

### 5.1 List All Admissions

```
GET /api/admissions/
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "firstName": "Alice",
      "lastName": "Johnson",
      "fullName": "Alice Johnson",
      "email": "alice@example.com",
      "phone": "+1234567890",
      "program": "uuid",
      "programName": "BSC-CS",
      "stage": "Applied",
      "status": "Active",
      "appliedDate": "2024-06-01",
      "createdAt": "2024-06-01T00:00:00Z",
      "updatedAt": "2024-06-01T00:00:00Z"
    }
  ]
}
```

**`stage` values:** `"Applied"`, `"Document Verification"`, `"Test/Interview"`, `"Result"`, `"Enrolled"`, `"Rejected"`

---

### 5.2 Create Admission

```
POST /api/admissions/
```

**Request Body:**

```json
{
  "firstName": "Alice",
  "lastName": "Johnson",
  "email": "alice@example.com",
  "phone": "+1234567890",
  "program": "uuid",
  "notes": "Additional notes",
  "documents": {}
}
```

**Optional fields:** `phone`, `program`, `notes`, `documents`

**Response (201):** Full admission detail object

---

### 5.3 Get Admission Detail

```
GET /api/admissions/<uuid>/
```

**Response (200):**

```json
{
  "id": "uuid",
  "firstName": "Alice",
  "lastName": "Johnson",
  "fullName": "Alice Johnson",
  "email": "alice@example.com",
  "phone": "+1234567890",
  "program": "uuid",
  "programName": "BSC-CS",
  "stage": "Applied",
  "status": "Active",
  "appliedDate": "2024-06-01",
  "notes": "Additional notes",
  "documents": {},
  "activity": [
    {
      "id": "uuid",
      "action": "Application submitted",
      "actor": "System",
      "timestamp": "2024-06-01T00:00:00Z"
    }
  ]
}
```

---

### 5.4 Update Admission

```
PUT /api/admissions/<uuid>/
PATCH /api/admissions/<uuid>/
```

**Request Body:** Same as create (partial updates supported with PATCH)

**Response (200):** Updated admission detail object

---

### 5.5 Delete Admission

```
DELETE /api/admissions/<uuid>/
```

**Response (200):**

```json
{
  "success": true,
  "message": "Admission deactivated successfully"
}
```

> **Note:** Soft delete — sets `status` to `"Inactive"`.

---

### 5.6 Update Admission Status

```
PATCH /api/admissions/<uuid>/status/
```

**Request Body:**

```json
{
  "stage": "Enrolled",
  "status": "Active",
  "notes": "Moved to enrolled"
}
```

All fields optional — update only what you need.

**Response (200):** Updated admission detail object

---

### 5.7 Convert Admission to Student

```
POST /api/admissions/<uuid>/convert/
```

Converts an enrolled admission into a student record.

**Response (200):**

```json
{
  "success": true,
  "message": "Admission converted to student successfully",
  "data": {
    "admissionId": "uuid",
    "status": "converted"
  }
}
```

**Error (400):** `"Only enrolled admissions can be converted"`

---

### 5.8 Bulk Action

```
POST /api/admissions/bulk-action/
```

**Request Body:**

```json
{
  "ids": ["uuid1", "uuid2"],
  "action": "stage",
  "stage": "Enrolled"
}
```

**`action` values:**
- `"stage"` — update stage (requires `stage` field)
- `"status"` — update status (requires `status` field)
- `"delete"` — soft delete all listed admissions

**Response (200):**

```json
{
  "success": true,
  "message": "2 admissions updated to Enrolled",
  "data": { "affected": 2 }
}
```

---

### 5.9 Admission Trend (Last 30 Days)

```
GET /api/admissions/trend/
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "total": 45,
    "daily": [
      { "date": "2024-06-01", "count": 3 },
      { "date": "2024-06-02", "count": 5 }
    ],
    "byStage": {
      "Applied": 20,
      "Enrolled": 15,
      "Rejected": 10
    }
  }
}
```

---

## 6. Notifications

**Auth required:** Admin or SuperAdmin (except mark read)

### 6.1 List All Notifications

```
GET /api/notifications/
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Important Update",
      "message": "Semester starts on Monday",
      "category": "Academic",
      "priority": "High",
      "status": "Published",
      "targetRoles": ["staff", "admin"],
      "isRead": false,
      "createdBy": "uuid",
      "createdByName": "Admin User",
      "createdAt": "2024-06-01T00:00:00Z",
      "updatedAt": "2024-06-01T00:00:00Z"
    }
  ]
}
```

**`category` values:** `"General"`, `"Academic"`, `"Admission"`, `"Urgent"`

**`priority` values:** `"Normal"`, `"High"`, `"Urgent"`

**`status` values:** `"Draft"`, `"Published"`, `"Archived"`

---

### 6.2 Create Notification

```
POST /api/notifications/
```

**Request Body:**

```json
{
  "title": "Important Update",
  "message": "Semester starts on Monday",
  "category": "Academic",
  "priority": "High",
  "status": "Draft",
  "targetRoles": ["staff", "admin"]
}
```

**Optional fields:** `category` (default: `"General"`), `priority` (default: `"Normal"`), `status` (default: `"Draft"`), `targetRoles`

**Response (201):** Full notification detail object

---

### 6.3 Get Notification Detail

```
GET /api/notifications/<uuid>/
```

**Response (200):** Full notification detail object

---

### 6.4 Update Notification

```
PUT /api/notifications/<uuid>/
PATCH /api/notifications/<uuid>/
```

**Request Body:** Same as create (partial updates supported with PATCH)

**Response (200):** Updated notification detail object

---

### 6.5 Delete (Archive) Notification

```
DELETE /api/notifications/<uuid>/
```

**Response (200):**

```json
{
  "success": true,
  "message": "Notification archived successfully"
}
```

> **Note:** Soft delete — sets `status` to `"Archived"`.

---

### 6.6 Publish Notification

```
PATCH /api/notifications/<uuid>/publish/
```

**Response (200):** Updated notification with `status: "Published"`

**Error (400):** `"Notification is already published"`

---

### 6.7 Mark as Read

```
PATCH /api/notifications/<uuid>/read/
```

**Auth:** Any authenticated user

**Response (200):**

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### 6.8 Bulk Action

```
POST /api/notifications/bulk-action/
```

**Request Body:**

```json
{
  "ids": ["uuid1", "uuid2"],
  "action": "publish"
}
```

**`action` values:** `"publish"`, `"archive"`, `"delete"`

**Response (200):**

```json
{
  "success": true,
  "message": "2 notifications published",
  "data": { "affected": 2 }
}
```

---

## 7. College Settings

**Auth required:** SuperAdmin only

### 7.1 Get College Info

```
GET /api/settings/
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "collegeName": "WCBT College",
    "collegeCode": "WCBT",
    "address": "123 College Road",
    "phone": "+1234567890",
    "email": "info@wcbt.edu",
    "website": "https://wcbt.edu",
    "logoUrl": "/media/logos/college.png",
    "establishedDate": "2000-01-01",
    "motto": "Excellence in Education",
    "academicYearStart": 2024,
    "maxStudentsPerProgram": 100,
    "enableEmailNotifications": true,
    "enableSmsNotifications": false,
    "defaultPassword": "ChangeMe@123",
    "catalog": {
      "departments": [
        { "id": "uuid", "name": "Computer Science" },
        { "id": "uuid", "name": "Business" }
      ],
      "designations": [
        { "id": "uuid", "name": "Lecturer" },
        { "id": "uuid", "name": "Senior Lecturer" }
      ],
      "testTypes": [
        { "id": "uuid", "name": "Written Test" },
        { "id": "uuid", "name": "Interview" }
      ]
    },
    "permissions": {
      "admin": {
        "staff": { "view": true, "add": true, "edit": true, "delete": false },
        "admissions": { "view": true, "add": true, "edit": true, "delete": false }
      },
      "staff": {
        "staff": { "view": true, "add": false, "edit": false, "delete": false },
        "admissions": { "view": true, "add": false, "edit": false, "delete": false }
      }
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### 7.2 Update College Info

```
PUT /api/settings/
PATCH /api/settings/
```

**Request Body:**

```json
{
  "collegeName": "WCBT College of Technology",
  "phone": "+9876543210",
  "enableEmailNotifications": true,
  "catalog": {
    "departments": [
      { "id": "uuid", "name": "Computer Science" }
    ],
    "designations": [
      { "id": "uuid", "name": "Lecturer" }
    ],
    "testTypes": [
      { "id": "uuid", "name": "Written Test" }
    ]
  }
}
```

**Response (200):** Updated college info object

---

### 7.3 Get Permissions

```
GET /api/settings/permissions/
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "admin": {
      "staff": { "view": true, "add": true, "edit": true, "delete": false },
      "admissions": { "view": true, "add": true, "edit": true, "delete": false },
      "programs": { "view": true, "add": true, "edit": true, "delete": false },
      "notifications": { "view": true, "add": true, "edit": true, "delete": false },
      "settings": { "view": false, "add": false, "edit": false, "delete": false },
      "files": { "view": true, "add": true, "edit": false, "delete": false },
      "dashboard": { "view": true }
    },
    "staff": {
      "staff": { "view": true, "add": false, "edit": false, "delete": false },
      "admissions": { "view": true, "add": false, "edit": false, "delete": false },
      "programs": { "view": true, "add": false, "edit": false, "delete": false },
      "notifications": { "view": true, "add": false, "edit": false, "delete": false },
      "settings": { "view": false, "add": false, "edit": false, "delete": false },
      "files": { "view": false, "add": false, "edit": false, "delete": false },
      "dashboard": { "view": false }
    }
  }
}
```

---

### 7.4 Update Permissions

```
PATCH /api/settings/permissions/
```

**Request Body:**

```json
{
  "permissions": {
    "admin": {
      "staff": { "view": true, "add": true, "edit": true, "delete": true }
    }
  }
}
```

**Response (200):** Updated permissions object

---

### 7.5 List Users

```
GET /api/settings/users/
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "status": "Active",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### 7.6 Create User

```
POST /api/settings/users/
```

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "firstName": "New",
  "lastName": "User",
  "role": "admin",
  "password": "SecurePass123"
}
```

**`role` values:** `"admin"`, `"staff"`

**Optional:** `password` (default: `"ChangeMe@123"`)

**Response (201):**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "uuid",
    "name": "New User",
    "email": "newuser@example.com",
    "role": "admin",
    "status": "Active"
  }
}
```

---

### 7.7 Deactivate User

```
DELETE /api/settings/users/<uuid>/
```

**Response (200):**

```json
{
  "success": true,
  "message": "User deactivated successfully"
}
```

**Error (400):** `"Cannot deactivate a super admin"`

---

## 8. Files

**Auth required:** Admin or SuperAdmin

### 8.1 List Files

```
GET /api/files/
```

**Query Params:**
- `category` — optional filter: `"staff"`, `"admission"`, `"program"`, `"notification"`, `"general"`

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "file": "/media/uploads/document.pdf",
      "fileUrl": "http://localhost:8000/media/uploads/document.pdf",
      "originalName": "document.pdf",
      "fileSize": 102400,
      "mimeType": "application/pdf",
      "category": "general",
      "uploadedBy": "uuid",
      "uploadedByName": "Admin User",
      "createdAt": "2024-06-01T00:00:00Z"
    }
  ]
}
```

---

### 8.2 Upload File

```
POST /api/files/upload/
```

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `file` — required, max 10MB
- `category` — optional: `"staff"`, `"admission"`, `"program"`, `"notification"`, `"general"` (default: `"general"`)

**Response (201):** Full uploaded file object

**Error (400):** `"File size exceeds 10MB limit"`

---

### 8.3 Delete File

```
DELETE /api/files/<uuid>/
```

**Response (200):**

```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

> **Note:** Permanently deletes the file from storage and the database record.

---

## 9. Dashboard

**Auth required:** Admin or SuperAdmin

### 9.1 Get Dashboard Summary

```
GET /api/dashboard/
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "staff": {
      "total": 25,
      "active": 22,
      "inactive": 3,
      "byDepartment": {
        "Computer Science": 10,
        "Mathematics": 8,
        "English": 7
      }
    },
    "programs": {
      "total": 8,
      "active": 7,
      "inactive": 1
    },
    "admissions": {
      "total": 150,
      "pending": 30,
      "enrolled": 100,
      "recent30Days": 25,
      "byStage": {
        "Applied": 30,
        "Document Verification": 10,
        "Test/Interview": 5,
        "Result": 5,
        "Enrolled": 100,
        "Rejected": 0
      }
    },
    "notifications": {
      "total": 45,
      "unread": 12
    },
    "files": {
      "total": 120
    }
  }
}
```

---

## Common Errors

| Status | Meaning |
|--------|---------|
| 400 | Bad Request — validation failed |
| 401 | Unauthorized — invalid or missing token |
| 403 | Forbidden — insufficient permissions |
| 404 | Not Found — resource doesn't exist |
| 500 | Internal Server Error |

All errors follow the standard envelope:

```json
{
  "success": false,
  "message": "Error description",
  "errors": { "fieldName": ["Error detail"] }
}
```

---

## JWT Token Lifecycle

- **Access Token:** expires in 30 minutes
- **Refresh Token:** expires in 7 days
- On refresh, a new access + refresh pair is returned
- The old refresh token is blacklisted (one-time use)
- Store the refresh token and call `/api/auth/refresh/` when the access token expires
- On logout, send the refresh token to blacklist it

**Recommended flow:**

1. Store `access` and `refresh` tokens (localStorage or secure cookie)
2. On 401 response, call `POST /api/auth/refresh/` with the refresh token
3. If refresh also fails, redirect to login
