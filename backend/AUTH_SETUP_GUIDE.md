# Authentication System Setup & Configuration Guide

## Overview

The PWD MIS now has a complete three-tier authentication system ready for frontend integration. This guide covers setup, configuration, and testing.

---

## Database Setup

### 1. Import the SQL Schema

```bash
mysql -u root -p < backend/sql/nangka_mis.sql
```

This creates:
- All tables with RBAC structure
- Roles (super_admin, admin, staff, social_worker)
- Permissions (16 different permissions)
- Pre-made super admin account

### 2. Set Super Admin Password

**Initial Password Hash:** `$2b$10$YourBcryptHashedPasswordHere`

Replace with a real hash:

```bash
node
```

```javascript
const bcrypt = require('bcryptjs');

// Generate hash for password
bcrypt.hash('SuperAdmin@123', 10).then(hash => {
  console.log('Hash:', hash);
  // Copy this hash and update the database
});
```

Then update the database:

```sql
UPDATE Person_In_Charge 
SET password_hash = '$2b$10$<actual_hash_here>' 
WHERE username = 'superadmin';
```

---

## Environment Configuration

### 1. Create `.env` file

```bash
cp backend/.env.example backend/.env
```

### 2. Configure `.env`

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=nangka_mis

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRY=7d

# Server
PORT=5000
NODE_ENV=development
```

**IMPORTANT:** Change `JWT_SECRET` to a strong random string in production!

Generate a strong secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Starting the Server

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Server starts at: `http://localhost:5000`

### 3. Verify Health Check

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-01-07T...",
  "system": "PWD Management Information System - Barangay Nangka, Marikina"
}
```

---

## Testing the Authentication System

### 1. Super Admin Login

**Initial Credentials:**
- Username: `superadmin`
- Password: `SuperAdmin@123` (or what you set)

```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "SuperAdmin@123"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "fullname": "System Administrator",
      "username": "superadmin",
      "role": "super_admin",
      "permissions": [...]
    }
  }
}
```

**Save the token for next steps:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
```

### 2. Create Admin Account (Using Super Admin Token)

```bash
curl -X POST http://localhost:5000/auth/create-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fullname": "Maria Santos",
    "username": "maria_admin",
    "email": "maria@barangay-nangka.gov.ph",
    "password": "AdminPass123",
    "role_id": 2,
    "position": "Administrative Officer",
    "contact_no": "09123456789"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Admin account created successfully",
  "data": {
    "person_id": 2,
    "fullname": "Maria Santos",
    "username": "maria_admin",
    "email": "maria@barangay-nangka.gov.ph",
    "role_id": 2
  }
}
```

### 3. Login as Admin

```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "maria_admin",
    "password": "AdminPass123"
  }'
```

Save this token for PWD account creation.

### 4. Create PWD User Account (Using Admin Token)

```bash
ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIs..."

curl -X POST http://localhost:5000/auth/create-pwd-account \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
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
  }'
```

Response:
```json
{
  "success": true,
  "message": "PWD account created successfully",
  "data": {
    "pwd_id": 1,
    "fullname": "Juan Dela Santos",
    "login_credentials": {
      "username": 1,
      "password_note": "Surname: Santos",
      "instruction": "Username is the PWD ID, Password is the surname"
    }
  }
}
```

### 5. Login as PWD User

```bash
curl -X POST http://localhost:5000/auth/pwd-login \
  -H "Content-Type: application/json" \
  -d '{
    "pwd_id": 1,
    "password": "Santos"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "pwd_id": 1,
      "fullname": "Juan Dela Santos",
      "type": "pwd_user",
      "can_view_record": true
    }
  }
}
```

### 6. Get PWD User Own Record

```bash
PWD_TOKEN="eyJhbGciOiJIUzI1NiIs..."

curl -X GET http://localhost:5000/pwd-user/me \
  -H "Authorization: Bearer $PWD_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "personal_info": {
      "pwd_id": 1,
      "firstname": "Juan",
      "lastname": "Santos",
      "sex": "Male",
      "birthdate": "1990-05-15",
      "civil_status": "Single",
      "contact_no": "09123456789",
      "registration_date": "2025-01-07T..."
    },
    "disabilities": [],
    "recent_claims": []
  }
}
```

---

## API Endpoints Summary

### Public Endpoints (No Auth Required)
- `POST /auth/login` - Staff/Admin/Super Admin login
- `POST /auth/pwd-login` - PWD user login

### Protected Endpoints (Auth Required)
- `POST /auth/create-admin` - Create admin/staff (Super Admin only)
- `POST /auth/create-pwd-account` - Create PWD account (Admin+)
- `POST /auth/refresh` - Refresh token (All authenticated users)
- `GET /pwd-user/me` - Get own record (PWD users only)
- `GET /pwd-user/disabilities` - Get own disabilities (PWD users only)
- `GET /pwd-user/claims` - Get own claims (PWD users only)
- `POST /pwd-user/verify` - Verify registration (PWD users only)

---

## Frontend Integration Checklist

### Login Forms Needed
- [ ] Super Admin / Admin Login Form
- [ ] PWD User Login Form (PWD ID + Surname)
- [ ] Password Reset Form (optional)

### Dashboard Components Needed
- [ ] Admin Dashboard (create accounts, manage records)
- [ ] PWD User Dashboard (view own record, disabilities, claims)

### Key Features to Implement
- [ ] Store JWT token in localStorage/sessionStorage
- [ ] Send token in Authorization header for all protected requests
- [ ] Redirect to login if token expires
- [ ] Show different UI based on user role
- [ ] Handle validation errors from API

### Environment Setup
```javascript
// frontend/.env
VITE_API_URL=http://localhost:5000
```

### Sample Login Component (React)
```javascript
import { useState } from 'react';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {error && <div className="error">{error}</div>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

---

## Troubleshooting

### Issue: "No token provided" error
**Solution:** Ensure Authorization header is included in protected requests
```javascript
headers: { 'Authorization': `Bearer ${token}` }
```

### Issue: "Token expired" error
**Solution:** Implement token refresh or ask user to login again
```javascript
const refreshToken = async () => {
  const response = await fetch('/auth/refresh', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  localStorage.setItem('token', data.data.token);
};
```

### Issue: "Invalid username or password"
**Solution:** 
- Verify username and password are correct
- Check if account is active in database
- For PWD users, password is surname (case-sensitive)

### Issue: "Access denied. Insufficient role privileges"
**Solution:** User's role doesn't have permission for this action
- Super Admin can do everything
- Admin can create PWD accounts
- Staff can only manage/view records

---

## Database Management

### View All Users
```sql
SELECT person_id, fullname, username, role_id, is_active FROM Person_In_Charge;
```

### View All PWD Users
```sql
SELECT pwd_id, firstname, lastname, registration_date FROM Nangka_PWD_user;
```

### Deactivate Account
```sql
UPDATE Person_In_Charge SET is_active = FALSE WHERE person_id = 2;
```

### Reset Password (Admin)
```bash
node
```
```javascript
const bcrypt = require('bcryptjs');
bcrypt.hash('newpassword123', 10).then(hash => {
  console.log(hash); // Use this hash
});
```
```sql
UPDATE Person_In_Charge SET password_hash = '<hash>' WHERE person_id = 2;
```

---

## Security Best Practices

1. **Change JWT_SECRET** in production to a strong random string
2. **Use HTTPS** in production
3. **Set strong passwords** when creating admin accounts
4. **Implement rate limiting** to prevent brute force attacks
5. **Log all authentication attempts** for audit trail
6. **Regular password changes** for admin accounts
7. **Keep dependencies updated** with `npm audit`

---

## Next Steps

1. ✅ Backend authentication is complete
2. 📋 Create frontend login forms
3. 📋 Implement role-based UI
4. 📋 Add protected route handling
5. 📋 Test complete authentication flow
6. 📋 Deploy to production with HTTPS

---

Created: January 7, 2026
System: Barangay Nangka PWD Management Information System
