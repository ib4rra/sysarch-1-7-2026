# 👨‍💻 Development Guide

Complete guide for developing features on the refactored backend.

## 📋 File Structure Best Practices

```
backend/
├── config/          # Configuration files (db, initialization)
├── controllers/     # Business logic handlers
├── middlewares/     # Express middleware (auth, error, etc)
├── models/          # Database operations (CRUD)
├── routes/          # API route definitions
├── validators/      # Input validation rules
├── uploads/         # User uploaded files
│   ├── avatars/     # User avatars
│   └── announcements/ # Announcements/attachments
└── server.js        # Entry point
```

## 🔄 Development Workflow

### 1. Create a New Feature Module

**Step 1: Create Model** (`models/feature.models.js`)
```javascript
import db from '../config/db.js';

export const getAll = async () => {
  const [rows] = await db.query('SELECT * FROM features');
  return rows;
};

export const findById = async (id) => {
  const [rows] = await db.query('SELECT * FROM features WHERE id = ?', [id]);
  return rows[0] || null;
};

export const create = async (data) => {
  const [result] = await db.query(
    'INSERT INTO features (name, description) VALUES (?, ?)',
    [data.name, data.description]
  );
  return { id: result.insertId, ...data };
};
```

**Step 2: Create Controller** (`controllers/feature.controller.js`)
```javascript
import * as FeatureModel from '../models/feature.models.js';

export const listFeatures = async (req, res) => {
  try {
    const features = await FeatureModel.getAll();
    res.json({
      success: true,
      data: features
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const getFeature = async (req, res) => {
  try {
    const feature = await FeatureModel.findById(req.params.id);
    if (!feature) {
      return res.status(404).json({
        success: false,
        message: 'Feature not found'
      });
    }
    res.json({ success: true, data: feature });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
```

**Step 3: Create Routes** (`routes/feature.routes.js`)
```javascript
import express from 'express';
import * as FeatureController from '../controllers/feature.controller.js';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', FeatureController.listFeatures);
router.get('/:id', FeatureController.getFeature);

// Protected routes
router.post('/', verifyToken, FeatureController.createFeature);

// Admin only
router.delete('/:id', verifyToken, authorizeRoles([2]), FeatureController.deleteFeature);

export default router;
```

**Step 4: Register Routes** (Update `routes/index.js`)
```javascript
import featureRoutes from './feature.routes.js';

router.use('/features', featureRoutes);
```

### 2. Add Input Validation

Create `validators/feature.validator.js`:
```javascript
import { body, validationResult } from 'express-validator';

export const createValidationRules = () => [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};
```

Use in routes:
```javascript
import { createValidationRules, handleValidationErrors } from '../validators/feature.validator.js';

router.post(
  '/',
  verifyToken,
  createValidationRules(),
  handleValidationErrors,
  FeatureController.createFeature
);
```

### 3. Handle File Uploads

```javascript
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/documents'));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${timestamp}-${originalName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    // Validate file types
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Use in route
router.post('/upload', verifyToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  
  res.json({
    success: true,
    message: 'File uploaded',
    file: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      path: `/uploads/documents/${req.file.filename}`
    }
  });
});
```

## 🧪 Testing Your Endpoints

### Using cURL

```bash
# Get all features
curl http://localhost:5000/features

# Get feature by ID
curl http://localhost:5000/features/1

# Create feature (with token)
curl -X POST http://localhost:5000/features \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name": "Feature 1", "description": "Test feature"}'

# Delete feature (admin only)
curl -X DELETE http://localhost:5000/features/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman

1. Create a new request
2. Set method and URL
3. Add Authorization header: `Bearer YOUR_TOKEN`
4. Add JSON body if needed
5. Click Send

## 🔐 Authentication in Routes

```javascript
// No authentication required
router.get('/public', controller.publicAction);

// Authentication required (any logged-in user)
router.get('/protected', verifyToken, controller.protectedAction);

// Specific role required (admin = role 2)
router.post('/', verifyToken, authorizeRoles([2]), controller.adminAction);

// Multiple roles allowed
router.get('/report', verifyToken, authorizeRoles([2, 3]), controller.report);
```

## 🗄️ Database Operations

### Using Promises (Modern)

```javascript
// Single query
const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
const user = rows[0];

// Insert with result
const [result] = await db.query(
  'INSERT INTO users (name, email) VALUES (?, ?)',
  [name, email]
);
const newId = result.insertId;

// Multiple rows
const [rows] = await db.query('SELECT * FROM users WHERE role_id = ?', [2]);
```

### Best Practices

✅ **DO:**
```javascript
// Use parameterized queries (prevents SQL injection)
const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

// Use transactions for multiple operations
const connection = await db.getConnection();
try {
  await connection.beginTransaction();
  await connection.query('UPDATE users SET ...');
  await connection.query('INSERT INTO logs ...');
  await connection.commit();
} catch (err) {
  await connection.rollback();
  throw err;
} finally {
  connection.release();
}
```

❌ **DON'T:**
```javascript
// Never concatenate user input into queries
const query = `SELECT * FROM users WHERE email = '${email}'`; // UNSAFE!

// Don't forget error handling
const [rows] = await db.query(sql); // What if it fails?
```

## 📊 Response Format Standard

All endpoints should follow this format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": 1,
    "name": "Example"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": []  // Optional validation errors
}
```

## 🐛 Debugging Tips

### Enable Console Logging
```javascript
// In your controller
console.log('Request received:', req.body);
console.log('User ID:', req.userId);
console.log('Query result:', rows);
```

### Check Request Headers
```javascript
console.log('Headers:', req.headers);
console.log('Authorization:', req.headers.authorization);
```

### View Database Queries
```javascript
// Enable MySQL query logging
// In config/db.js, add debug logging
```

### Use Postman
- Check request/response details
- View headers and body
- Test different scenarios
- Create test collections

## 📚 Common Patterns

### Pagination
```javascript
export const getWithPagination = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const [rows] = await db.query(
    'SELECT * FROM items LIMIT ? OFFSET ?',
    [limit, offset]
  );
  const [countResult] = await db.query('SELECT COUNT(*) as total FROM items');
  
  return {
    data: rows,
    pagination: {
      page,
      limit,
      total: countResult[0].total,
      pages: Math.ceil(countResult[0].total / limit)
    }
  };
};
```

### Search
```javascript
export const search = async (query) => {
  const searchTerm = `%${query}%`;
  const [rows] = await db.query(
    'SELECT * FROM items WHERE name LIKE ? OR description LIKE ?',
    [searchTerm, searchTerm]
  );
  return rows;
};
```

### Soft Delete
```javascript
export const softDelete = async (id) => {
  await db.query(
    'UPDATE items SET deleted_at = NOW() WHERE id = ?',
    [id]
  );
};

export const getActive = async () => {
  const [rows] = await db.query(
    'SELECT * FROM items WHERE deleted_at IS NULL'
  );
  return rows;
};
```

## 🚀 Performance Optimization

1. **Use indexes** on frequently queried columns
2. **Limit query results** with LIMIT and OFFSET
3. **Select only needed columns** (don't use SELECT *)
4. **Use connection pooling** (already configured)
5. **Cache frequently accessed data** if needed
6. **Batch operations** when possible

## 📝 Code Style Guidelines

- Use `const` for variables (don't use `var`)
- Use async/await (not `.then()`)
- Use descriptive variable names
- Add comments for complex logic
- Keep functions focused and small
- Use consistent formatting (Prettier recommended)

---

Happy developing! 🎉 Refer back to this guide when creating new features.
