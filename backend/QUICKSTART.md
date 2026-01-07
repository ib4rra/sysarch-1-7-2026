# 🚀 Quick Start Guide

Get your refactored backend running in 5 minutes!

## Step 1: Install Dependencies
```bash
cd backend
npm install
```

## Step 2: Setup Environment
Copy `.env.example` to `.env` and update values:
```bash
cp .env.example .env
```

Edit `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=sysarch
JWT_SECRET=your-secret-key-change-this
```

## Step 3: Create Database
```sql
CREATE DATABASE sysarch;
USE sysarch;

-- Create users table
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role_id INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create roles table
CREATE TABLE roles (
  role_id INT PRIMARY KEY,
  role_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

-- Insert default roles
INSERT INTO roles VALUES
(1, 'user', 'Regular user'),
(2, 'admin', 'Administrator'),
(3, 'instructor', 'Instructor'),
(4, 'student', 'Student');
```

## Step 4: Run Server
```bash
npm run dev
```

You should see:
```
🚀 Server running on port 5000
✅ MySQL Connected...
```

## Step 5: Test API
Try registering a user:
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "userId": 1,
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

## 📚 Next Steps

1. **Read the full README.md** for complete API documentation
2. **Use TEMPLATE files** to create new modules
3. **Enable table creation** in `config/init-db.js` as needed
4. **Add validation** in `validators/` for your endpoints
5. **Test endpoints** with Postman or similar tool

## ✅ Key Features

✓ ES Modules (modern JavaScript)
✓ JWT Authentication
✓ Role-based Access Control
✓ MySQL with Promise support
✓ Error Handling Middleware
✓ Input Validation
✓ File Upload Ready
✓ Clean Architecture
✓ Easy to Extend

## 🆘 Troubleshooting

**Error: Cannot find module 'dotenv'**
```bash
npm install
```

**Error: ECONNREFUSED (MySQL)**
- Verify MySQL is running
- Check DB credentials in `.env`
- Ensure database `sysarch` exists

**Error: Module not found .js extension**
- All imports must include `.js` extension in ES modules
- Example: `import routes from './routes/index.js'`

---

Happy coding! 🎉
