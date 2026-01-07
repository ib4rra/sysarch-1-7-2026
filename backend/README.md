# PWD Management Information System (MIS) - Barangay Nangka, Marikina

A modern, scalable backend for managing Persons with Disabilities (PWD) registry, benefits, programs, and services in Barangay Nangka, Marikina. Built with Node.js/Express and ES modules.

## 📋 System Overview

This MIS system helps barangay officials efficiently manage:
- PWD registrations and profiles
- Benefits and assistance programs
- Health and disability records
- Service appointments and requests
- Beneficiary claims and disbursements
- Barangay personnel management

## 📁 Project Structure

```
backend/
├── config/
│   ├── db.js                    # MySQL connection pool
│   └── init-db.js              # Database initialization
├── controllers/
│   ├── auth.controller.js       # Auth logic (register, login, refresh)
│   ├── user.controller.js       # User profile operations
│   └── adminController.js       # Admin operations (template)
├── middlewares/
│   ├── auth.middleware.js       # JWT verification & role authorization
│   └── error.middleware.js      # Error handling
├── models/
│   └── user.models.js           # User CRUD operations
├── routes/
│   ├── index.js                 # Main router
│   ├── auth.routes.js           # Auth endpoints
│   ├── user.routes.js           # User endpoints
│   └── admin.routes.js          # Admin endpoints
├── validators/
│   └── auth.validator.js        # Input validation rules
├── uploads/                     # File upload storage
│   ├── avatars/                 # User avatars
│   └── announcements/           # Announcements
├── .env                         # Environment variables
├── server.js                    # Entry point
└── package.json                 # Dependencies

```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment variables:**
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   NODE_ENV=development

   # Database
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=sysarch

   # JWT
   JWT_SECRET=your-super-secret-key-change-this-in-production
   JWT_EXPIRY=7d
   ```

3. **Create database:**
   ```sql
   CREATE DATABASE sysarch;
   ```

4. **Run the server:**
   ```bash
   npm run dev    # Development with hot reload
   npm start      # Production
   ```

## 📝 Database Schema (PWD MIS)

Start with these core tables for PWD management:

```sql
-- Users/Accounts Table
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role_id INT DEFAULT 1,
  barangay_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Roles Table (Barangay Staff)
CREATE TABLE roles (
  role_id INT PRIMARY KEY,
  role_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

-- Insert default roles
INSERT INTO roles (role_id, role_name, description) VALUES
(1, 'pwd_registrant', 'PWD Registrant'),
(2, 'admin', 'Barangay Administrator'),
(3, 'staff', 'Barangay Staff'),
(4, 'social_worker', 'Social Worker/Case Manager');

-- PWD Registrants Table
CREATE TABLE pwd_registrants (
  pwd_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  registry_number VARCHAR(20) UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(10),
  civil_status VARCHAR(50),
  address VARCHAR(255),
  barangay VARCHAR(100),
  contact_number VARCHAR(20),
  emergency_contact VARCHAR(100),
  emergency_number VARCHAR(20),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Disability Types Table
CREATE TABLE disability_types (
  disability_id INT AUTO_INCREMENT PRIMARY KEY,
  disability_name VARCHAR(100) NOT NULL,
  description TEXT
);

-- PWD Disability Records
CREATE TABLE pwd_disabilities (
  record_id INT AUTO_INCREMENT PRIMARY KEY,
  pwd_id INT NOT NULL,
  disability_id INT NOT NULL,
  severity_level VARCHAR(50), -- Mild, Moderate, Severe
  disability_percentage INT,
  disability_certificate_number VARCHAR(100),
  certificate_date DATE,
  issued_by VARCHAR(100),
  notes TEXT,
  FOREIGN KEY (pwd_id) REFERENCES pwd_registrants(pwd_id),
  FOREIGN KEY (disability_id) REFERENCES disability_types(disability_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Benefits/Programs Table
CREATE TABLE assistance_programs (
  program_id INT AUTO_INCREMENT PRIMARY KEY,
  program_name VARCHAR(150) NOT NULL,
  description TEXT,
  monthly_benefit DECIMAL(10, 2),
  program_type VARCHAR(50), -- Medical, Financial, Educational, etc
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Beneficiary Claims Table
CREATE TABLE beneficiary_claims (
  claim_id INT AUTO_INCREMENT PRIMARY KEY,
  pwd_id INT NOT NULL,
  program_id INT NOT NULL,
  claim_date DATE NOT NULL,
  claim_amount DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, received
  approved_by INT,
  approval_date DATE,
  notes TEXT,
  FOREIGN KEY (pwd_id) REFERENCES pwd_registrants(pwd_id),
  FOREIGN KEY (program_id) REFERENCES assistance_programs(program_id),
  FOREIGN KEY (approved_by) REFERENCES users(user_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Service Requests Table
CREATE TABLE service_requests (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  pwd_id INT NOT NULL,
  request_type VARCHAR(100), -- Medical Assistance, Livelihood, Education, etc
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, completed, rejected
  assigned_to INT,
  request_date DATE NOT NULL,
  completion_date DATE,
  remarks TEXT,
  FOREIGN KEY (pwd_id) REFERENCES pwd_registrants(pwd_id),
  FOREIGN KEY (assigned_to) REFERENCES users(user_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Activity Logs Table
CREATE TABLE activity_logs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action VARCHAR(255),
  pwd_id INT,
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

Uncomment and enable these queries in `config/init-db.js` as needed.

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - Register new barangay staff or PWD
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh JWT token

### User (Protected)
- `GET /user/profile` - Get current user profile
- `PUT /user/profile` - Update user profile
- `POST /user/change-password` - Change password

### PWD Registrants (Protected - Staff)
- `GET /pwd/registrants` - List all PWD registrants
- `GET /pwd/registrants/:pwdId` - Get PWD profile
- `POST /pwd/registrants` - Register new PWD
- `PUT /pwd/registrants/:pwdId` - Update PWD profile
- `DELETE /pwd/registrants/:pwdId` - Remove PWD

### Disabilities (Protected - Staff)
- `GET /disability/types` - List disability types
- `GET /pwd/:pwdId/disabilities` - Get PWD disabilities
- `POST /pwd/:pwdId/disabilities` - Add disability record
- `PUT /disability/record/:recordId` - Update disability record
- `DELETE /disability/record/:recordId` - Remove disability record

### Assistance Programs (Protected - Staff)
- `GET /programs` - List all assistance programs
- `POST /programs` - Create new program (admin only)
- `PUT /programs/:programId` - Update program (admin only)

### Beneficiary Claims (Protected - Staff)
- `GET /claims` - List all claims
- `GET /claims/:claimId` - Get claim details
- `POST /claims` - Create new claim
- `PUT /claims/:claimId` - Update claim status (staff/admin)
- `DELETE /claims/:claimId` - Remove claim

### Service Requests (Protected - Staff)
- `GET /services` - List all service requests
- `GET /services/:requestId` - Get request details
- `POST /services` - Create new service request
- `PUT /services/:requestId` - Update request status
- `DELETE /services/:requestId` - Remove request

### Admin (Protected - Admin only)
- `GET /admin/dashboard` - Admin dashboard
- `GET /admin/reports` - Generate reports
- `GET /admin/activity-logs` - View activity logs

### Health
- `GET /health` - Server health check

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-token-here>
```

**Token payload structure:**
```javascript
{
  id: 1,              // user_id
  role_id: 1,         // user's role
  iat: 1234567890,    // issued at
  exp: 1234654290     // expiry
}
```

## 🛡️ Role-Based Access Control

- **Role 1:** PWD Registrant (can view own profile, submit service requests)
- **Role 2:** Admin (full system access, manage staff, reports)
- **Role 3:** Barangay Staff (manage PWD records, process claims, handle requests)
- **Role 4:** Social Worker (manage cases, add observations, follow-ups)

Use `authorizeRoles([2])` in routes to restrict access:

```javascript
router.get('/protected', verifyToken, authorizeRoles([2]), controller.action);
```

## 📦 Key Dependencies

- **express:** Web framework
- **mysql2:** MySQL database driver with promise support
- **jsonwebtoken:** JWT handling
- **bcryptjs:** Password hashing
- **cors:** CORS handling
- **dotenv:** Environment variables
- **express-validator:** Input validation
- **multer:** File uploads

## 🔧 Extending the Backend

### Adding a New Module

1. **Create a new controller:**
   ```javascript
   // controllers/product.controller.js
   export const getProducts = async (req, res) => {
     try {
       // Your logic here
       res.json({ success: true, data: [] });
     } catch (err) {
       res.status(500).json({ success: false, message: err.message });
     }
   };
   ```

2. **Create a model (if needed):**
   ```javascript
   // models/product.models.js
   export const getAll = async () => {
     const [rows] = await db.query('SELECT * FROM products');
     return rows;
   };
   ```

3. **Create routes:**
   ```javascript
   // routes/product.routes.js
   import express from 'express';
   import * as ProductController from '../controllers/product.controller.js';
   import { verifyToken } from '../middlewares/auth.middleware.js';

   const router = express.Router();
   router.get('/', verifyToken, ProductController.getProducts);
   export default router;
   ```

4. **Register route in `routes/index.js`:**
   ```javascript
   import productRoutes from './product.routes.js';
   router.use('/products', productRoutes);
   ```

## 📚 Example API Requests

### Register User
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get User Profile (with token)
```bash
curl -X GET http://localhost:5000/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🐛 Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "status": 400,
  "message": "Error description",
  "errors": []  // Optional: for validation errors
}
```

## 📋 Checklist for New Project

- [ ] Update `.env` with your database credentials
- [ ] Create your database schema (uncomment in `config/init-db.js`)
- [ ] Update JWT_SECRET in `.env` to a strong value
- [ ] Create additional models as needed
- [ ] Create additional controllers for business logic
- [ ] Register new routes in `routes/index.js`
- [ ] Test all endpoints with Postman or similar
- [ ] Setup CORS properly for your frontend domain
- [ ] Configure file upload limits in multer (if using)

## 🚨 Important Notes

1. **Never commit `.env` file** - Add to `.gitignore`
2. **Change JWT_SECRET** in production to a strong, random value
3. **Database passwords** should be stored in `.env` file, never hardcoded
4. **MySQL connection pool** is configured with max 10 connections by default
5. **File uploads** are stored in `uploads/` directory - ensure proper cleanup

## 📞 Support & Development

For issues or questions:
1. Check error messages in console
2. Verify `.env` configuration
3. Ensure MySQL is running and accessible
4. Check database permissions and user creation SQL

---

**Last Updated:** January 2026
**Architecture Style:** ES Modules + Express.js + MySQL
