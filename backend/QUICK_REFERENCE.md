# Backend Authentication - Quick Reference Card

## Installation & Startup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Server runs on: http://localhost:5000
```

---

## Database Setup (First Time Only)

```bash
# Import SQL schema
mysql -u root -p < backend/sql/nangka_mis.sql

# Update super admin password in database
# (See AUTH_SETUP_GUIDE.md for details)
```

---

## Environment File (`.env`)

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=nangka_mis
JWT_SECRET=your-secret-key
JWT_EXPIRY=7d
PORT=5000
```

---

## Three Login Types

### 1. Super Admin / Admin / Staff Login
**Endpoint:** `POST /auth/login`
```json
{
  "username": "superadmin",
  "password": "SuperAdmin@123"
}
```

### 2. PWD User Login
**Endpoint:** `POST /auth/pwd-login`
```json
{
  "pwd_id": 1,
  "password": "Santos"
}
```

### 3. Token Refresh
**Endpoint:** `POST /auth/refresh`
- Requires Authorization header with valid token
- Returns new token

---

## Protected Requests

Add to all protected endpoints:
```
Authorization: Bearer <token>
```

JavaScript:
```javascript
const token = localStorage.getItem('token');
fetch('/pwd-user/me', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## Create Admin Account

**Endpoint:** `POST /auth/create-admin`
**Access:** Super Admin only

```json
{
  "fullname": "Jane Smith",
  "username": "jane_admin",
  "email": "jane@example.com",
  "password": "Password123",
  "role_id": 2,
  "position": "Admin",
  "contact_no": "09123456789"
}
```

---

## Create PWD User Account

**Endpoint:** `POST /auth/create-pwd-account`
**Access:** Admin+ only

```json
{
  "firstname": "Juan",
  "middlename": "Dela",
  "lastname": "Santos",
  "suffix": "Jr.",
  "sex": "Male",
  "birthdate": "1990-05-15",
  "civil_status": "Single",
  "address": "123 St, Barangay Nangka",
  "contact_no": "09123456789",
  "guardian_name": "Maria",
  "guardian_contact": "09187654321"
}
```

**Returns:** PWD_ID (username) and Surname (password for login)

---

## PWD User Endpoints

### Get Own Record
```
GET /pwd-user/me
```

### Get Own Disabilities
```
GET /pwd-user/disabilities
```

### Get Own Claims Status
```
GET /pwd-user/claims
```

### Verify Registration
```
POST /pwd-user/verify
```

---

## Role IDs

| ID | Role | Can Create | Can Do |
|----|------|-----------|--------|
| 1 | super_admin | Admins, Staffs | Everything |
| 2 | admin | PWD accounts, Staffs | Manage PWD, Process claims |
| 3 | staff | None | View/Edit PWD, Process claims |
| 4 | social_worker | None | Assist PWD, View records |

---

## Files Structure

```
backend/
├── controllers/
│   ├── auth.controller.js          ← Login/register logic
│   └── pwd-user.controller.js      ← PWD user endpoints
├── routes/
│   ├── auth.routes.js              ← Auth endpoints
│   └── pwd-user.routes.js          ← PWD user endpoints
├── models/
│   └── pwd-user.models.js          ← PWD database queries
├── middlewares/
│   └── auth.middleware.js          ← Token verification, RBAC
├── validators/
│   └── auth.validator.js           ← Input validation rules
├── sql/
│   └── nangka_mis.sql              ← Complete database schema
└── [docs]
    ├── AUTH_API_DOCUMENTATION.md   ← Full API reference
    ├── AUTH_SETUP_GUIDE.md         ← Setup & testing
    └── AUTHENTICATION_IMPLEMENTATION_SUMMARY.md
```

---

## Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (invalid credentials) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not found |
| 409 | Conflict (username exists) |
| 500 | Server error |

---

## Token Structure

### Staff/Admin Token
```json
{
  "id": 1,
  "username": "admin",
  "role_id": 2,
  "role_name": "admin",
  "permissions": ["create_pwd_account", ...]
}
```

### PWD User Token
```json
{
  "id": 1,
  "type": "pwd_user",
  "firstname": "Juan",
  "lastname": "Santos"
}
```

---

## Testing Flow (cURL)

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"SuperAdmin@123"}' \
  | jq -r '.data.token')

# 2. Use token
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/pwd-user/me
```

---

## Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "username",
      "message": "Username must be at least 3 characters"
    }
  ]
}
```

---

## Validation Rules

### Staff Login
- Username: 3+ chars
- Password: 6+ chars

### PWD Login
- PWD ID: Integer
- Password: 2+ chars

### Create Admin
- Full name: 3+ chars
- Username: 3-100 chars, alphanumeric only
- Email: Valid format
- Password: 8+ chars (uppercase + lowercase + digit)
- Role ID: 2-4

### Create PWD
- First name: 2+ chars
- Last name: 2+ chars
- Sex: Male/Female/Other
- Birthdate: Valid date, not future
- Civil status: Single/Married/Divorced/Widowed/Separated
- Address: 5+ chars

---

## Useful SQL Queries

```sql
-- View all staff
SELECT * FROM Person_In_Charge;

-- View all PWD users
SELECT * FROM Nangka_PWD_user;

-- View roles and permissions
SELECT r.role_name, p.permission_name 
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.role_id
JOIN permissions p ON rp.permission_id = p.permission_id;

-- Deactivate account
UPDATE Person_In_Charge SET is_active = FALSE WHERE person_id = 1;

-- Reset password
UPDATE Person_In_Charge 
SET password_hash = '$2b$10$<hash>' 
WHERE person_id = 1;
```

---

## Frontend Integration Points

1. **Login Component** - Send credentials to `/auth/login` or `/auth/pwd-login`
2. **Store Token** - Save to localStorage after login
3. **Protected Routes** - Check token presence, redirect to login if missing
4. **API Calls** - Include `Authorization: Bearer <token>` header
5. **Token Refresh** - Call `/auth/refresh` before token expires
6. **Logout** - Clear localStorage and redirect to login
7. **Role-Based UI** - Show/hide features based on `user.role` or `user.permissions`

---

## Documentation Files

- **AUTH_API_DOCUMENTATION.md** - Complete API reference with examples
- **AUTH_SETUP_GUIDE.md** - Installation, configuration, and testing
- **AUTHENTICATION_IMPLEMENTATION_SUMMARY.md** - What was implemented and why
- **This file** - Quick reference card

---

## Commands

```bash
# Development
npm run dev

# Check for errors
npm test

# Install dependencies
npm install

# Database import
mysql -u root -p < backend/sql/nangka_mis.sql

# Generate bcrypt hash (in node)
const bcrypt = require('bcryptjs');
bcrypt.hash('password', 10).then(console.log);
```

---

## Security Reminders

⚠️ **Important:**
- Change `JWT_SECRET` in production
- Update super admin password before deploying
- Use HTTPS in production
- Never commit `.env` to git
- Keep dependencies updated: `npm audit`
- Implement rate limiting in production
- Enable CORS properly for your domain

---

## Support Resources

- API Docs: See `AUTH_API_DOCUMENTATION.md`
- Setup Help: See `AUTH_SETUP_GUIDE.md`
- Implementation Details: See `AUTHENTICATION_IMPLEMENTATION_SUMMARY.md`
- Full Documentation: See backend README files

---

Last Updated: January 7, 2026
System: Barangay Nangka PWD Management Information System
