# Authentication & Authorization API Documentation

## Overview

The Barangay Nangka PWD MIS implements a three-tier authentication system with Role-Based Access Control (RBAC):

1. **Super Admin** - System administrator, manages admins and system settings
2. **Admin** - Creates and manages PWD user accounts, processes claims
3. **Staff** - Manages PWD records and processes beneficiary claims
4. **PWD Users** - Limited access, can only view their own registration record

---

## Authentication Endpoints

### 1. Staff/Admin/Super Admin Login

**Endpoint:** `POST /auth/login`

**Access:** Public (No authentication required)

**Request Body:**
```json
{
  "username": "staffusername",
  "password": "password123"
}
```

**Validation Rules:**
- Username: Required, min 3 characters
- Password: Required, min 6 characters

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "fullname": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "admin",
      "permissions": ["create_pwd_account", "manage_pwd_records", "process_claims", ...]
    }
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid username or password"
}
```

**Notes:**
- Returns JWT token with role and permissions
- Token expires in 7 days (configurable via JWT_EXPIRY)
- User must have active account (is_active = TRUE)

---

### 2. PWD User Login

**Endpoint:** `POST /auth/pwd-login`

**Access:** Public (No authentication required)

**Request Body:**
```json
{
  "pwd_id": 1,
  "password": "Santos"
}
```

**Validation Rules:**
- PWD ID: Required, must be integer
- Password: Required, min 2 characters (surname)

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "pwd_id": 1,
      "fullname": "Juan Santos",
      "type": "pwd_user",
      "can_view_record": true
    }
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid PWD ID or password"
}
```

**Notes:**
- Username = PWD_ID (auto-generated at account creation)
- Password = Surname (bcryptjs hashed)
- Limited token scope - can only access own record
- Token expires in 7 days

---

### 3. Refresh Token

**Endpoint:** `POST /auth/refresh`

**Access:** Protected (Requires valid JWT token)

**Request Header:**
```
Authorization: Bearer <token>
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Notes:**
- Returns new JWT token
- Validates user still exists and is active

---

## Account Creation Endpoints

### 4. Create Admin/Staff Account (Super Admin Only)

**Endpoint:** `POST /auth/create-admin`

**Access:** Protected (Super Admin only - role_id = 1)

**Request Header:**
```
Authorization: Bearer <super_admin_token>
```

**Request Body:**
```json
{
  "fullname": "Jane Smith",
  "username": "janesmith",
  "email": "jane@barangay-nangka.gov.ph",
  "password": "SecurePass123",
  "role_id": 2,
  "position": "Administrative Officer",
  "contact_no": "09123456789"
}
```

**Validation Rules:**
- Fullname: Required, min 3 characters
- Username: Required, 3-100 characters, alphanumeric with underscore/hyphen only
- Email: Required, valid email format
- Password: Required, min 8 characters, must contain uppercase, lowercase, and digit
- Role ID: Required, must be 2-4 (admin, staff, social_worker)
- Position: Optional
- Contact No: Optional, must be valid phone format

**Response (Success):**
```json
{
  "success": true,
  "message": "Admin account created successfully",
  "data": {
    "person_id": 5,
    "fullname": "Jane Smith",
    "username": "janesmith",
    "email": "jane@barangay-nangka.gov.ph",
    "role_id": 2
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Username already exists"
}
```

**Available Roles:**
- 1 = super_admin
- 2 = admin
- 3 = staff
- 4 = social_worker

---

### 5. Create PWD User Account (Admin+)

**Endpoint:** `POST /auth/create-pwd-account`

**Access:** Protected (Admin and Super Admin only - role_id 1 or 2)

**Request Header:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "firstname": "Juan",
  "middlename": "Dela",
  "lastname": "Santos",
  "suffix": "Jr.",
  "sex": "Male",
  "birthdate": "1990-05-15",
  "civil_status": "Single",
  "address": "123 Sampaguita St, Barangay Nangka, Marikina City",
  "contact_no": "09123456789",
  "guardian_name": "Maria Santos",
  "guardian_contact": "09187654321"
}
```

**Validation Rules:**
- Firstname: Required, min 2 characters
- Lastname: Required, min 2 characters
- Middlename: Optional
- Suffix: Optional
- Sex: Required, must be "Male", "Female", or "Other"
- Birthdate: Required, valid ISO8601 date, cannot be future date
- Civil Status: Required, must be "Single", "Married", "Divorced", "Widowed", or "Separated"
- Address: Required, min 5 characters
- Contact No: Optional, valid phone format
- Guardian Name: Optional
- Guardian Contact: Optional, valid phone format

**Response (Success):**
```json
{
  "success": true,
  "message": "PWD account created successfully",
  "data": {
    "pwd_id": 25,
    "fullname": "Juan Dela Santos",
    "login_credentials": {
      "username": 25,
      "password_note": "Surname: Santos",
      "instruction": "Username is the PWD ID, Password is the surname"
    }
  }
}
```

**Notes:**
- System automatically generates PWD ID (auto-increment)
- Password is set to surname and bcryptjs hashed
- Login credentials: PWD_ID (username) + Surname (password)
- PWD user can login immediately after account creation
- Admin should provide login credentials to PWD user securely

---

## PWD User Access Endpoints

### 6. Get Own Record

**Endpoint:** `GET /pwd-user/me`

**Access:** Protected (PWD users only)

**Request Header:**
```
Authorization: Bearer <pwd_user_token>
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "personal_info": {
      "pwd_id": 1,
      "firstname": "Juan",
      "middlename": "Dela",
      "lastname": "Santos",
      "suffix": "Jr.",
      "sex": "Male",
      "birthdate": "1990-05-15",
      "civil_status": "Single",
      "contact_no": "09123456789",
      "registration_date": "2025-01-07T10:30:00Z"
    },
    "disabilities": [
      {
        "pwd_disability_id": 1,
        "disability_id": 1,
        "disability_name": "Physical Disability",
        "severity": "moderate",
        "date_identified": "2024-01-15"
      }
    ],
    "recent_claims": [
      {
        "claim_id": 5,
        "claim_type": "Medical Assistance",
        "claim_date": "2025-01-06",
        "status": "approved",
        "updated_at": "2025-01-07T09:00:00Z"
      }
    ]
  }
}
```

**Notes:**
- Limited information visible (no address, guardian info shown to PWD user)
- Includes disability information and recent claims status

---

### 7. Get Own Disabilities

**Endpoint:** `GET /pwd-user/disabilities`

**Access:** Protected (PWD users only)

**Response (Success):**
```json
{
  "success": true,
  "data": [
    {
      "pwd_disability_id": 1,
      "disability_id": 1,
      "disability_name": "Physical Disability",
      "severity": "moderate",
      "date_identified": "2024-01-15"
    },
    {
      "pwd_disability_id": 2,
      "disability_id": 4,
      "disability_name": "Intellectual Disability",
      "severity": "mild",
      "date_identified": "2023-06-10"
    }
  ]
}
```

---

### 8. Get Own Claims Status

**Endpoint:** `GET /pwd-user/claims`

**Access:** Protected (PWD users only)

**Response (Success):**
```json
{
  "success": true,
  "data": [
    {
      "claim_id": 5,
      "claim_type": "Medical Assistance",
      "claim_date": "2025-01-06",
      "status": "approved",
      "updated_at": "2025-01-07T09:00:00Z"
    },
    {
      "claim_id": 4,
      "claim_type": "Educational Support",
      "claim_date": "2024-12-15",
      "status": "pending",
      "updated_at": "2024-12-15T14:30:00Z"
    }
  ]
}
```

---

### 9. Verify Registration

**Endpoint:** `POST /pwd-user/verify`

**Access:** Protected (PWD users only)

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "registered": true,
    "pwd_id": 1,
    "message": "You are officially registered in Barangay Nangka PWD MIS"
  }
}
```

---

## Authorization & Permissions

### Role Hierarchy
```
Super Admin (1)
  ├── Can create admin accounts
  ├── Can manage system settings
  └── Has all permissions

Admin (2)
  ├── Can create PWD user accounts
  ├── Can manage PWD records
  ├── Can process claims
  └── Limited permissions (no system settings)

Staff (3)
  ├── Can view PWD records
  ├── Can edit PWD records
  ├── Can process claims
  └── Basic operational permissions

PWD User (N/A - separate system)
  └── Can only view own record
```

### Permission List
```
Super Admin Permissions:
- manage_admins
- manage_staff
- view_all_records
- manage_system_settings
- view_system_logs

Admin Permissions:
- create_pwd_account
- manage_pwd_records
- process_claims
- manage_disabilities
- view_claims_analytics

Staff Permissions:
- view_pwd_records
- edit_pwd_records
- process_pwd_claims
- upload_documents

PWD User Permissions (implicit):
- view_own_record
- view_own_disabilities
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "username",
      "message": "Username must be at least 3 characters"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid username or password"
}
```

### 403 Forbidden (Token Expired)
```json
{
  "success": false,
  "message": "Token expired"
}
```

### 403 Forbidden (Insufficient Permissions)
```json
{
  "success": false,
  "message": "Access denied. Insufficient role privileges."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Record not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Username already exists"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Login failed"
}
```

---

## Authentication Headers

All protected endpoints require the following header:

```
Authorization: Bearer <jwt_token>
```

Alternative methods also supported:
- `x-access-token` header
- `token` query parameter
- `token` in request body

---

## Pre-made Accounts

### Super Admin (Initial Account)
**Note:** Replace password hash in database after first setup.

```
Username: superadmin
Password: SuperAdmin@123 (change on first login)
Role: Super Admin
```

**To generate new password hash:**
```bash
bcryptjs.hash('YourPassword123', 10)
```

---

## Token Structure

### Staff/Admin Token Payload
```json
{
  "id": 1,
  "username": "johndoe",
  "role_id": 2,
  "role_name": "admin",
  "permissions": ["create_pwd_account", "manage_pwd_records", ...]
}
```

### PWD User Token Payload
```json
{
  "id": 25,
  "type": "pwd_user",
  "firstname": "Juan",
  "lastname": "Santos"
}
```

---

## Implementation Notes

1. **Password Security:** All passwords are hashed using bcryptjs with 10 salt rounds
2. **Token Expiry:** Default 7 days, configurable via `JWT_EXPIRY` environment variable
3. **Rate Limiting:** Not implemented in this version (recommended for production)
4. **HTTPS:** Required in production
5. **CORS:** Enabled for frontend integration
6. **Database:** All operations use prepared statements to prevent SQL injection

---

## Quick Start for Frontend

### 1. Staff Login
```javascript
const response = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'staffusername',
    password: 'password123'
  })
});

const data = await response.json();
localStorage.setItem('token', data.data.token);
```

### 2. PWD User Login
```javascript
const response = await fetch('/auth/pwd-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pwd_id: 25,
    password: 'Santos'  // surname
  })
});

const data = await response.json();
localStorage.setItem('token', data.data.token);
```

### 3. Protected Request
```javascript
const response = await fetch('/pwd-user/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

const data = await response.json();
console.log(data.data);
```

---

## Environment Variables

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=nangka_mis

JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY=7d

PORT=5000
NODE_ENV=development
```

---

Created: January 7, 2026
System: Barangay Nangka PWD Management Information System
