# 📚 PWD MIS Backend Documentation

**Management Information System for PWD - Barangay Nangka, Marikina**

---

## 🎯 Start Here

**New to this system?** Start with one of these:

1. **[COMPLETION_SUMMARY.md](./COMPLETION_SUMMARY.md)** ⭐ **READ FIRST** (5 min)
   - Overview of what you have
   - Features ready to use
   - Quick start guide

2. **[PWD_MIS_GUIDE.md](./PWD_MIS_GUIDE.md)** (10 min)
   - Quick reference for all endpoints
   - Common tasks
   - Troubleshooting

3. **[QUICKSTART.md](./QUICKSTART.md)** (5 min)
   - Get server running immediately
   - Step-by-step setup
   - Run your first test

---

## 📖 Complete Documentation

### Essential Reading

- **[README.md](./README.md)** - Full API reference & architecture
  - System overview
  - Database schema
  - All endpoints
  - Configuration guide

- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Building new features
  - Creating controllers
  - Database operations
  - Input validation
  - Testing endpoints

### Quick Guides

- **[PWD_MIS_GUIDE.md](./PWD_MIS_GUIDE.md)** - Quick reference
  - API endpoints
  - Common tasks
  - Role permissions
  - Troubleshooting

- **[QUICKSTART.md](./QUICKSTART.md)** - 5-minute setup
  - Installation
  - Database setup
  - Running server
  - Testing

### Reference

- **[.env.example](./.env.example)** - Configuration template
- **[REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md)** - Technical details

---

## 🗂️ Key Files

### Core Application
```
server.js              ✅ Entry point (ES modules)
package.json           ✅ Dependencies configured
.env.example           ✅ Configuration template
```

### Configuration
```
config/db.js                    ✅ MySQL connection
config/init-db.js              ✅ Database setup
```

### API Layer (PWD MIS Specific)
```
controllers/
  ├── pwd.controller.js         ✅ PWD registrants
  ├── disability.controller.js  ✅ Disability management
  ├── claims.controller.js      ✅ Benefits & claims
  ├── auth.controller.js        ✅ Authentication
  └── user.controller.js        ✅ User management

models/
  ├── pwd.models.js             ✅ PWD database ops
  ├── disability.models.js      ✅ Disability ops
  ├── claims.models.js          ✅ Claims ops
  └── user.models.js            ✅ User ops

routes/
  ├── pwd.routes.js             ✅ PWD endpoints
  ├── disability.routes.js      ✅ Disability endpoints
  ├── claims.routes.js          ✅ Claims endpoints
  ├── auth.routes.js            ✅ Auth endpoints
  └── user.routes.js            ✅ User endpoints
```

### Security & Middleware
```
middlewares/
  ├── auth.middleware.js        ✅ JWT & roles
  └── error.middleware.js       ✅ Error handling

validators/
  └── auth.validator.js         ✅ Input validation
```

---

## 🔌 API Endpoints Overview

### PWD Registry
```
/pwd                 GET    List all PWD
/pwd                 POST   Register new PWD
/pwd/:pwdId          GET    Get PWD profile
/pwd/:pwdId          PUT    Update PWD
/pwd/:pwdId          DELETE Delete PWD
/pwd/search          GET    Search PWD
```

### Disability Management
```
/disability/types                   GET    List types
/disability/pwd/:pwdId              GET    Get disabilities
/disability/pwd/:pwdId              POST   Add disability
/disability/record/:recordId        PUT    Update
/disability/record/:recordId        DELETE Remove
```

### Beneficiary Claims
```
/claims              GET    List claims
/claims              POST   Create claim
/claims/:claimId     GET    Get claim
/claims/pwd/:pwdId   GET    Get PWD claims
/claims/:claimId     PUT    Update status
/claims/stats        GET    Statistics
```

### Authentication & Users
```
/auth/register       POST   Register
/auth/login          POST   Login
/auth/refresh        POST   Refresh token
/user/profile        GET    Your profile
/user/profile        PUT    Update profile
```

### Admin
```
/admin/dashboard     GET    Dashboard
/admin/users         GET    List users
```

---

## 🚀 Getting Started

### Installation (5 minutes)
```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your database details

# 3. Create database
CREATE DATABASE barangay_nangka_pwd;

# 4. Create tables (from README.md SQL)

# 5. Start server
npm run dev         # Development
npm start           # Production
```

### Test It Works
```bash
curl http://localhost:5000/health
```

---

## 🛡️ User Roles

| Role | ID | Description |
|------|----|----|
| Admin | 2 | Full system access |
| Barangay Staff | 3 | Manage PWD, process claims |
| Social Worker | 4 | Case management |
| PWD Registrant | 1 | View own profile |

---

## 📊 Database Tables

### PWD Management
- `users` - Accounts
- `pwd_registrants` - PWD profiles
- `disability_types` - Master list
- `pwd_disabilities` - PWD records
- `assistance_programs` - Benefits
- `beneficiary_claims` - Claims
- `service_requests` - Requests
- `activity_logs` - Audit trail

---

## 🎓 Learning Path

### Beginner (15 minutes)
1. Read [COMPLETION_SUMMARY.md](./COMPLETION_SUMMARY.md)
2. Read [PWD_MIS_GUIDE.md](./PWD_MIS_GUIDE.md)
3. Follow [QUICKSTART.md](./QUICKSTART.md)

### Intermediate (30 minutes)
1. Read [README.md](./README.md)
2. Review existing controllers
3. Test endpoints with Postman

### Advanced (60+ minutes)
1. Read [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
2. Create new features
3. Extend as needed

---

## 🔍 Finding What You Need

| I want to... | Read... | Time |
|---|---|---|
| Quick overview | [COMPLETION_SUMMARY.md](./COMPLETION_SUMMARY.md) | 5 min |
| Get it running | [QUICKSTART.md](./QUICKSTART.md) | 5 min |
| API reference | [PWD_MIS_GUIDE.md](./PWD_MIS_GUIDE.md) | 10 min |
| Full docs | [README.md](./README.md) | 20 min |
| Build features | [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) | 30 min |
| Configure | [.env.example](./.env.example) | 2 min |

---

## ✨ Features Ready

### PWD Management ✅
- Register PWD
- Manage profiles
- Search registrants
- Track history

### Disability Tracking ✅
- Multiple disabilities per PWD
- Severity levels
- Certificates
- Doctor info

### Benefits System ✅
- Multiple programs
- Claim processing
- Approval workflow
- Disbursement tracking

### Staff Management ✅
- User accounts
- Role assignment
- Activity logging
- Access control

### Security ✅
- JWT authentication
- Password hashing
- Role-based access
- Activity audit trail

---

## 🐛 Troubleshooting

### Server won't start
→ Check Node.js installed  
→ Run `npm install` first  
→ Check port 5000 not in use

### Database connection failed
→ MySQL running?  
→ Check .env credentials  
→ Database exists?

### Permission denied
→ Wrong user role  
→ Check JWT token valid  
→ Token might be expired

### See more
→ Read [PWD_MIS_GUIDE.md](./PWD_MIS_GUIDE.md) troubleshooting section

---

## ✅ Pre-Launch Checklist

- [ ] Create database `barangay_nangka_pwd`
- [ ] Run SQL schema from README.md
- [ ] Edit .env with real credentials
- [ ] Test endpoints with Postman
- [ ] Change JWT_SECRET to random string
- [ ] Set NODE_ENV=production in .env
- [ ] Setup backup strategy
- [ ] Test all user roles
- [ ] Review security settings
- [ ] Document any customizations

---

## 📞 Support

### Quick Help
1. Check [PWD_MIS_GUIDE.md](./PWD_MIS_GUIDE.md) - Most answers here
2. Check [README.md](./README.md) - Detailed explanations
3. Check error messages - Very informative
4. Check console logs - Debugging info

### Common Issues
- Database: See QUICKSTART.md Step 2
- Authentication: See PWD_MIS_GUIDE.md
- Endpoints: See README.md API section
- Building: See DEVELOPMENT_GUIDE.md

---

## 🎉 Ready to Launch!

Your backend is:
- ✅ Complete & configured
- ✅ Well documented
- ✅ Secure by default
- ✅ Production ready
- ✅ Easy to maintain
- ✅ Ready to extend

---

## 📋 Documentation Map

```
START HERE
    ↓
[COMPLETION_SUMMARY.md] (5 min)
    ↓
[PWD_MIS_GUIDE.md] (10 min) ← Quick reference
    ↓
[QUICKSTART.md] (5 min) ← Get running
    ↓
[README.md] (20 min) ← Full docs
    ↓
[DEVELOPMENT_GUIDE.md] (30 min) ← Build features
    ↓
[Code] ← Start coding!
```

---

**System:** PWD Management Information System  
**Location:** Barangay Nangka, Marikina  
**Status:** 🟢 Production Ready  
**Version:** 1.0.0  

**Start now:** [COMPLETION_SUMMARY.md](./COMPLETION_SUMMARY.md) ⭐
