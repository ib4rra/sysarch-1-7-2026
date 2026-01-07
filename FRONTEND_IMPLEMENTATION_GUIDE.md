# 🚀 Next Steps - Frontend Development Guide

## Where You Are Now

✅ **Backend is 100% complete:**
- All authentication endpoints implemented
- RBAC system fully configured
- Database schema ready
- Complete API documentation
- Production-ready code

**Your next task:** Build the frontend UI and integrate with the backend.

---

## 📋 Frontend Implementation Tasks

### Phase 1: Authentication Forms (1-2 days)

#### 1.1 Staff/Admin Login Form
**What user sees:**
- Username input field
- Password input field
- Login button
- Error message display
- Redirect on success

**What it does:**
1. Collects username and password
2. POST to `/auth/login`
3. Stores token in localStorage
4. Stores user info
5. Redirects to dashboard

**Reference:** [AUTH_API_DOCUMENTATION.md#1-staffadminsuperadmin-login](AUTH_API_DOCUMENTATION.md#1-staffadminsuperadmin-login)

**Sample Code (React):**
```javascript
const handleStaffLogin = async (username, password) => {
  const res = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  const data = await res.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    // Redirect to /dashboard
  }
};
```

#### 1.2 PWD User Login Form
**What user sees:**
- PWD ID input field (numeric)
- Password input field (surname)
- Login button
- Help text: "Username is your PWD ID, Password is your surname"
- Error message display
- Redirect on success

**What it does:**
1. Collects PWD ID and surname
2. POST to `/auth/pwd-login`
3. Stores token in localStorage
4. Stores user info
5. Redirects to PWD dashboard

**Reference:** [AUTH_API_DOCUMENTATION.md#2-pwd-user-login](AUTH_API_DOCUMENTATION.md#2-pwd-user-login)

**Sample Code (React):**
```javascript
const handlePwdLogin = async (pwd_id, password) => {
  const res = await fetch('/auth/pwd-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pwd_id: parseInt(pwd_id), password })
  });
  
  const data = await res.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    // Redirect to /pwd-dashboard
  }
};
```

#### 1.3 Logout Function
**What it does:**
1. Clear token from localStorage
2. Clear user info from localStorage
3. Redirect to login page

**Sample Code (React):**
```javascript
const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Redirect to /
};
```

---

### Phase 2: Protected Routes & Navigation (1-2 days)

#### 2.1 Protected Route Component
**What it does:**
- Check if token exists
- Redirect to login if not
- Show component if authenticated

**Sample Code (React Router):**
```javascript
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/" />;
  }
  
  return children;
}

// Usage
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

#### 2.2 Navigation by Role
**What it does:**
- Show different navigation based on user role
- Super Admin: All features
- Admin: Account creation + PWD management
- Staff: PWD management only
- PWD User: Only "My Record" view

**Sample Code (React):**
```javascript
function Navigation() {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user) return <LoginLinks />;
  
  if (user.role === 'super_admin') {
    return (
      <nav>
        <a href="/admin">Manage Admins</a>
        <a href="/pwd-management">Manage PWD</a>
        <a href="/settings">System Settings</a>
      </nav>
    );
  } else if (user.role === 'admin') {
    return (
      <nav>
        <a href="/create-account">Create Account</a>
        <a href="/pwd-management">Manage PWD</a>
      </nav>
    );
  } else if (user.type === 'pwd_user') {
    return (
      <nav>
        <a href="/my-record">My Record</a>
        <a href="/my-claims">My Claims</a>
      </nav>
    );
  }
}
```

---

### Phase 3: Admin Dashboard (2-3 days)

#### 3.1 Create Admin Account Page
**What user sees:**
- Form with fields: fullname, username, email, password, role, position, contact
- Create button
- Success/error message
- List of created accounts

**What it does:**
1. Show form
2. Validate inputs
3. POST to `/auth/create-admin`
4. Display response
5. Refresh list

**Reference:** [AUTH_API_DOCUMENTATION.md#4-create-adminstaffaccount-super-admin-only](AUTH_API_DOCUMENTATION.md#4-create-adminstaffaccount-super-admin-only)

**Sample Code (React):**
```javascript
const createAdmin = async (adminData) => {
  const token = localStorage.getItem('token');
  
  const res = await fetch('/auth/create-admin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(adminData)
  });
  
  const data = await res.json();
  if (data.success) {
    alert('Admin created successfully!');
    // Refresh list
  } else {
    alert(data.message);
  }
};
```

#### 3.2 Create PWD Account Page
**What user sees:**
- Large form with 11 fields
- Required field indicators
- Date picker for birthdate
- Dropdown for sex and civil status
- Submit button
- Generated login credentials display

**What it does:**
1. Show form
2. Validate all inputs
3. POST to `/auth/create-pwd-account`
4. Display success with login credentials
5. Allow printing/copying credentials

**Reference:** [AUTH_API_DOCUMENTATION.md#5-create-pwd-user-account-admin](AUTH_API_DOCUMENTATION.md#5-create-pwd-user-account-admin)

**Sample Code (React):**
```javascript
const createPwdAccount = async (pwdData) => {
  const token = localStorage.getItem('token');
  
  const res = await fetch('/auth/create-pwd-account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(pwdData)
  });
  
  const data = await res.json();
  if (data.success) {
    // Show credentials to user
    console.log('PWD ID:', data.data.pwd_id);
    console.log('Username:', data.data.login_credentials.username);
    console.log('Password:', data.data.login_credentials.password_note);
  }
};
```

#### 3.3 PWD Management Page
**What user sees:**
- Search/filter for PWD users
- List of all PWD users with key info
- View/Edit button for each
- Delete option

**What it does:**
- Fetch from `/pwd` endpoint (already implemented)
- Display in table format
- Allow editing and deleting

---

### Phase 4: PWD User Dashboard (1-2 days)

#### 4.1 My Record Page
**What user sees:**
- Personal information (name, sex, birthdate, etc.)
- Contact information
- Registration date
- Edit button (optional)

**What it does:**
1. GET `/pwd-user/me`
2. Display personal_info section
3. Show in read-only format

**Reference:** [AUTH_API_DOCUMENTATION.md#6-get-own-record](AUTH_API_DOCUMENTATION.md#6-get-own-record)

**Sample Code (React):**
```javascript
const [record, setRecord] = useState(null);

useEffect(() => {
  const fetchRecord = async () => {
    const token = localStorage.getItem('token');
    
    const res = await fetch('/pwd-user/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await res.json();
    setRecord(data.data.personal_info);
  };
  
  fetchRecord();
}, []);

return (
  <div>
    <h2>{record?.firstname} {record?.lastname}</h2>
    <p>Sex: {record?.sex}</p>
    <p>Birthdate: {record?.birthdate}</p>
    {/* ... more fields ... */}
  </div>
);
```

#### 4.2 My Disabilities Page
**What user sees:**
- List of recorded disabilities
- Severity level for each
- Date identified

**What it does:**
1. GET `/pwd-user/disabilities`
2. Display in card or list format
3. Show severity color-coded (mild/moderate/severe)

**Reference:** [AUTH_API_DOCUMENTATION.md#7-get-own-disabilities](AUTH_API_DOCUMENTATION.md#7-get-own-disabilities)

#### 4.3 My Claims Page
**What user sees:**
- List of claims submitted
- Claim type
- Status (pending/approved/denied/processed)
- Date submitted
- Date updated

**What it does:**
1. GET `/pwd-user/claims`
2. Display in table
3. Color-code status (pending=yellow, approved=green, denied=red)

**Reference:** [AUTH_API_DOCUMENTATION.md#8-get-own-claims-status](AUTH_API_DOCUMENTATION.md#8-get-own-claims-status)

#### 4.4 Verify Registration (Optional)
**What user sees:**
- Button "Verify My Registration"
- Message confirming official registration

**What it does:**
1. POST `/pwd-user/verify`
2. Display confirmation message

**Reference:** [AUTH_API_DOCUMENTATION.md#9-verify-registration](AUTH_API_DOCUMENTATION.md#9-verify-registration)

---

### Phase 5: Error Handling & UX (1 day)

#### 5.1 Handle Token Expiry
**What to do:**
- Check for 401 responses
- Redirect to login
- Show "Session expired" message
- Offer token refresh

**Sample Code:**
```javascript
const fetchWithAuth = async (url, options = {}) => {
  let res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  if (res.status === 401) {
    // Try to refresh token
    const refreshRes = await fetch('/auth/refresh', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    if (refreshRes.ok) {
      const data = await refreshRes.json();
      localStorage.setItem('token', data.data.token);
      
      // Retry original request
      res = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${data.data.token}`
        }
      });
    } else {
      // Redirect to login
      window.location.href = '/';
    }
  }
  
  return res;
};
```

#### 5.2 Validation Feedback
**What to do:**
- Display field-specific error messages
- Show all validation errors at once
- Highlight invalid fields in red

**Sample:**
```javascript
if (!data.success) {
  const errors = {};
  data.errors.forEach(err => {
    errors[err.field] = err.message;
  });
  // Display errors next to each field
}
```

#### 5.3 Loading States
**What to do:**
- Show spinner while loading
- Disable button while submitting
- Show progress indicator for long operations

---

## 📁 Suggested Folder Structure (React)

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Login/
│   │   │   ├── StaffLogin.jsx
│   │   │   └── PwdLogin.jsx
│   │   ├── Admin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreateAdmin.jsx
│   │   │   ├── CreatePwd.jsx
│   │   │   └── ManagePwd.jsx
│   │   └── Pwd/
│   │       ├── Dashboard.jsx
│   │       ├── MyRecord.jsx
│   │       ├── MyDisabilities.jsx
│   │       └── MyClaims.jsx
│   ├── components/
│   │   ├── ProtectedRoute.jsx
│   │   ├── Navigation.jsx
│   │   └── LoadingSpinner.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useApi.js
│   ├── utils/
│   │   ├── api.js
│   │   └── auth.js
│   └── App.jsx
└── .env
```

---

## 🎯 Implementation Priority

### Week 1: Core Authentication
- [ ] Staff/Admin Login Form
- [ ] PWD Login Form
- [ ] Protected Routes
- [ ] Role-based Navigation
- [ ] Logout functionality

### Week 2: Admin Features
- [ ] Create Admin Form
- [ ] Create PWD Form
- [ ] List/Manage PWD Users
- [ ] Error handling

### Week 3: PWD User Features
- [ ] My Record page
- [ ] My Disabilities page
- [ ] My Claims page
- [ ] Verification page

### Week 4: Polish & Testing
- [ ] Error messages
- [ ] Loading states
- [ ] Token refresh
- [ ] Security testing
- [ ] Bug fixes

---

## 🧪 Testing Checklist

### Login Tests
- [ ] Staff login works
- [ ] Admin login works
- [ ] PWD login works
- [ ] Invalid credentials rejected
- [ ] Token stored correctly

### Authorization Tests
- [ ] Super Admin can access all features
- [ ] Admin cannot access super admin features
- [ ] Staff cannot create accounts
- [ ] PWD user cannot access admin features
- [ ] PWD user can only see own record

### Error Handling
- [ ] Network errors handled
- [ ] Invalid input shows errors
- [ ] Token expiry redirects to login
- [ ] 404 shows not found message
- [ ] 500 shows error message

### UX Tests
- [ ] Forms are user-friendly
- [ ] Error messages are clear
- [ ] Loading indicators work
- [ ] Responsive on mobile
- [ ] Logout works properly

---

## 📚 Resources Needed

### API Documentation
✅ [AUTH_API_DOCUMENTATION.md](AUTH_API_DOCUMENTATION.md) - Complete endpoint reference
✅ [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick lookup
✅ [AUTH_SETUP_GUIDE.md](AUTH_SETUP_GUIDE.md) - Setup and examples

### Example cURL Requests
✅ All provided in [AUTH_SETUP_GUIDE.md](AUTH_SETUP_GUIDE.md#testing-flow-curl)

### Frontend Framework
- React (recommended)
- Vue.js (alternative)
- Angular (alternative)

### State Management
- React Context API (simple)
- Redux (complex apps)
- Pinia (Vue apps)

### HTTP Client
- Fetch API (built-in)
- Axios (more features)

---

## ⚠️ Common Mistakes to Avoid

❌ **Don't:** Store password in state
✅ **Do:** Only store token in localStorage

❌ **Don't:** Make API calls without Authorization header
✅ **Do:** Always include `Authorization: Bearer <token>`

❌ **Don't:** Redirect before checking token
✅ **Do:** Verify token exists before accessing protected routes

❌ **Don't:** Show sensitive data in localStorage
✅ **Do:** Only store token and basic user info

❌ **Don't:** Ignore validation errors
✅ **Do:** Display error messages to users

❌ **Don't:** Forget to handle 401 responses
✅ **Do:** Redirect to login on token expiry

---

## 🎓 Learning Resources

### For Frontend Development
- React: https://react.dev
- Vue: https://vuejs.org
- Angular: https://angular.io

### For JWT Understanding
- JWT.io for token debugging
- Read intro at: https://jwt.io/introduction

### For API Integration
- MDN Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

---

## 🚀 Success Metrics

Your frontend is ready when:
- ✅ Users can login with username/password
- ✅ PWD users can login with ID/surname
- ✅ Token is stored and sent with requests
- ✅ Protected routes redirect to login
- ✅ Logout clears token
- ✅ Role-based UI shows correct features
- ✅ Admin can create accounts
- ✅ PWD users see only their data
- ✅ All error cases handled gracefully
- ✅ Tests pass

---

## 📞 Need Help?

### Backend not starting?
→ See [AUTH_SETUP_GUIDE.md#starting-the-server](AUTH_SETUP_GUIDE.md#starting-the-server)

### Don't understand an endpoint?
→ See [AUTH_API_DOCUMENTATION.md](AUTH_API_DOCUMENTATION.md)

### Need cURL examples?
→ See [AUTH_SETUP_GUIDE.md#testing-flow-curl](AUTH_SETUP_GUIDE.md#testing-flow-curl)

### Have errors?
→ Check [AUTH_API_DOCUMENTATION.md#error-responses](AUTH_API_DOCUMENTATION.md#error-responses)

---

## 🎉 You're Ready to Build!

The backend is complete. All documentation is provided. All examples are working.

**Start with:** Building the Login Forms (Phase 1)
**Reference:** [AUTH_API_DOCUMENTATION.md#1-staffadminsuperadmin-login](AUTH_API_DOCUMENTATION.md#1-staffadminsuperadmin-login)
**Test with:** cURL examples in [AUTH_SETUP_GUIDE.md](AUTH_SETUP_GUIDE.md)

Good luck! 🚀

---

Created: January 7, 2026
System: Barangay Nangka PWD Management Information System
Status: **READY FOR FRONTEND DEVELOPMENT** ✅
