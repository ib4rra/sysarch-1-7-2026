# PWD MIS - Quick Reference Guide

**System:** Management Information System for PWD - Barangay Nangka, Marikina  
**Built with:** Express.js + MySQL + ES Modules  
**Status:** Ready for deployment

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your database details

# 3. Create database
CREATE DATABASE barangay_nangka_pwd;

# 4. Run migrations/create tables
# (See README.md for SQL schema)

# 5. Start server
npm run dev         # Development
npm start           # Production
```

---

## 📋 API Endpoints Summary

### Authentication
```
POST   /auth/register           Register staff/PWD
POST   /auth/login              Login
POST   /auth/refresh            Refresh token
```

### PWD Registry
```
GET    /pwd                     List all PWD
POST   /pwd                     Register new PWD
GET    /pwd/:pwdId             Get PWD profile
PUT    /pwd/:pwdId             Update PWD info
DELETE /pwd/:pwdId             Remove PWD (admin)
GET    /pwd/search?query=name   Search PWD
```

### Disabilities
```
GET    /disability/types                List disability types
GET    /disability/pwd/:pwdId          Get PWD disabilities
POST   /disability/pwd/:pwdId          Add disability
PUT    /disability/record/:recordId    Update disability
DELETE /disability/record/:recordId    Remove disability
```

### Beneficiary Claims
```
GET    /claims                  List all claims
POST   /claims                  Create claim
GET    /claims/:claimId        Get claim details
GET    /claims/pwd/:pwdId      Get PWD's claims
PUT    /claims/:claimId        Update claim status
DELETE /claims/:claimId        Remove claim
GET    /claims/stats           Get statistics
```

### User Management
```
GET    /user/profile           Your profile
PUT    /user/profile           Update profile
POST   /user/change-password   Change password
```

### Admin
```
GET    /admin/dashboard        Dashboard
GET    /admin/users            List staff
PUT    /admin/users/:userId    Update user
DELETE /admin/users/:userId    Remove user
```

---

## 🔑 Key Features

### PWD Registrant
- First/middle/last name
- Date of birth, gender, civil status
- Address and contact information
- Emergency contact
- Registry number (unique ID)

### Disability Management
- Multiple disability types per PWD
- Severity levels (Mild, Moderate, Severe)
- Disability percentage (0-100%)
- Certificate information
- Official issuance details

### Benefits System
- Multiple assistance programs
- Monthly benefit amounts
- Claim tracking
- Status management (pending, approved, received)
- Disbursement tracking

### Service Requests
- Multiple request types
- Status tracking
- Staff assignment
- Completion notes
- Follow-up capability

---

## 🔐 Authentication

```javascript
// Login response includes JWT token
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "userId": 1,
    "email": "staff@barangay.gov.ph",
    "roleId": 3
  }
}

// Use token in subsequent requests
Authorization: Bearer <token>
```

---

## 📊 Database Tables

### Core Tables
- `users` - Staff and registrant accounts
- `pwd_registrants` - PWD profiles
- `disability_types` - Master list of disabilities
- `pwd_disabilities` - PWD disability records
- `assistance_programs` - Available benefits
- `beneficiary_claims` - Claims and disbursements
- `service_requests` - Service requests
- `activity_logs` - System audit trail

---

## 🎯 Common Tasks

### Register New PWD
```bash
POST /pwd
{
  "firstName": "Juan",
  "lastName": "Dela Cruz",
  "dateOfBirth": "1980-05-15",
  "gender": "Male",
  "contactNumber": "09123456789",
  "address": "123 Main St",
  "barangay": "Nangka"
}
```

### Add Disability Record
```bash
POST /disability/pwd/1
{
  "disabilityId": 3,
  "severityLevel": "Moderate",
  "disabilityPercentage": 60,
  "disabilityCertificateNumber": "PWD-2024-001",
  "certificateDate": "2024-01-15",
  "issuedBy": "Department of Health"
}
```

### Create Benefit Claim
```bash
POST /claims
{
  "pwdId": 1,
  "programId": 2,
  "claimDate": "2024-01-15",
  "claimAmount": 2500,
  "notes": "Monthly assistance"
}
```

### Update Claim Status
```bash
PUT /claims/5
{
  "status": "approved",
  "approvalDate": "2024-01-20",
  "notes": "Approved for disbursement"
}
```

---

## 🛡️ Role Access Control

| Role | PWD | Staff | Admin | Social Worker |
|------|-----|-------|-------|---------------|
| View own profile | ✅ | ✅ | ✅ | ✅ |
| List PWD | ✅ | ✅ | ✅ | ✅ |
| Register PWD | - | ✅ | ✅ | - |
| Manage disabilities | - | ✅ | ✅ | ✅ |
| Process claims | - | ✅ | ✅ | - |
| Approve claims | - | ✅ | ✅ | - |
| Delete records | - | - | ✅ | - |
| Manage staff | - | - | ✅ | - |
| View reports | - | ✅ | ✅ | ✅ |

---

## 🐛 Troubleshooting

### Database Connection Failed
- Check MySQL is running
- Verify DB_HOST, DB_USER, DB_PASSWORD in .env
- Ensure database exists

### Token Expired
- Get new token: `POST /auth/refresh`
- Or login again: `POST /auth/login`

### Permission Denied
- Check user role matches endpoint requirements
- Admin-only endpoints require role_id = 2
- Staff endpoints allow role_id = 2, 3, 4

### Port Already in Use
- Change PORT in .env
- Or kill process: `lsof -ti:5000 | xargs kill -9`

---

## 📝 Configuration

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=barangay_nangka_pwd

# Security
JWT_SECRET=change-to-random-string-in-production
JWT_EXPIRY=7d

# System
BARANGAY_NAME=Barangay Nangka, Marikina
SYSTEM_NAME=PWD Management Information System
```

---

## 📚 Documentation Files

- **START_HERE.md** - Overview (this file's purpose)
- **README.md** - Full architecture & reference
- **QUICKSTART.md** - 5-minute setup
- **DEVELOPMENT_GUIDE.md** - Building new features
- **REFACTORING_SUMMARY.md** - Technical changes

---

## ✨ Next Steps

1. Follow [QUICKSTART.md](./QUICKSTART.md) to setup
2. Read [README.md](./README.md) for full reference
3. Create database and import schema
4. Test endpoints with Postman
5. Deploy to barangay server

---

**Created for:** Barangay Nangka, Marikina  
**Last Updated:** January 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
