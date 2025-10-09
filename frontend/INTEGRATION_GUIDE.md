# Frontend-Backend Integration Guide

## ✅ What Has Been Integrated

### 1. Environment Variables
- Created `.env` file with API URL configuration
- API base URL: `http://localhost:3001/api`

### 2. API Service Layer (`src/services/api.js`)
Complete API integration with:
- **Authentication API**: login, getMe, updatePassword, logout
- **Admin API**: registerAdmin, getAllUsers, getUser, activateUser, deactivateUser
- **Doctor API**: addPatient, addDoctor, addPharmacist, getPatients, getDoctors, getPharmacists

### 3. Auth Service (`src/services/authService.js`)
Client-side authentication management:
- Token storage/retrieval
- User session management
- Role-based access checking

### 4. Updated Components

#### SignIn Page (`src/pages/SignIn.jsx`)
- ✅ Integrated with backend login API
- ✅ Stores JWT token and user data
- ✅ Redirects based on user role
- ✅ Proper error handling

#### Admin Dashboard (`src/pages/AdminDashboard.jsx`)
- ✅ Complete rewrite with API integration
- ✅ Real-time user management
- ✅ Add doctors, patients, pharmacists
- ✅ Activate/deactivate users
- ✅ Filter users by role
- ✅ Display auto-generated passwords
- ✅ Loading states and error handling

---

## 🚀 How to Use

### Step 1: Start Backend Server
```bash
cd backend/server
npm run seed    # Optional: Create test users
npm run dev     # Start server
```

Server runs on: `http://localhost:3001`

### Step 2: Start Frontend
```bash
cd frontend
npm run dev
```

Frontend runs on: `http://localhost:5173`

### Step 3: Test the Integration

#### Option A: Use Seeded Data
If you ran `npm run seed`, use these credentials:

```
Admin:       admin@healthtrack.com       / Admin@12345
Doctor:      doctor@healthtrack.com      / Doctor@12345
Patient:     patient@healthtrack.com     / Patient@12345
Pharmacist:  pharmacist@healthtrack.com  / Pharmacist@12345
```

#### Option B: Register New Admin
1. Go to backend terminal
2. Run seed script or manually register:
```bash
# Using curl or Postman
POST http://localhost:3001/api/admin/register
{
  "email": "admin@test.com",
  "password": "Admin@123",
  "firstName": "Test",
  "lastName": "Admin",
  "phone": "+1234567890"
}
```

---

## 📋 Features Implemented

### Login Flow
1. User enters email and password
2. Frontend calls `/api/auth/login`
3. Backend validates credentials
4. Returns JWT token + user data
5. Frontend stores token in localStorage
6. Redirects to role-specific dashboard

### Admin Dashboard Features

#### User Management
- **View All Users**: See all users in the system
- **Filter by Role**: View doctors, patients, or pharmacists separately
- **Add Users**: Add new doctors, patients, or pharmacists
  - Auto-generates unique ID (DOC00001, PAT00001, etc.)
  - Creates random password
  - Displays password for sharing with new user
- **Activate/Deactivate**: Toggle user status
- **Real-time Stats**: See counts of users by role

#### Add User Flow
1. Click "Add Doctor/Patient/Pharmacist"
2. Fill in user details (email, first name, last name, phone)
3. Submit form
4. System creates user with auto-generated password
5. Password displayed for admin to share with user
6. User list refreshes automatically

---

## 🔧 API Integration Details

### Request Flow
```
Frontend Component
    ↓
API Service (src/services/api.js)
    ↓
HTTP Request with JWT Token
    ↓
Backend API (http://localhost:3001/api)
    ↓
Response
    ↓
Component State Update
```

### Authentication Headers
All protected requests include:
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### Error Handling
- Network errors caught and displayed to user
- Invalid credentials show error message
- API errors display user-friendly messages
- Loading states prevent multiple submissions

---

## 📁 New Files Created

```
frontend/
├── .env                              # Environment variables
└── src/
    └── services/
        ├── api.js                    # API service layer
        └── authService.js            # Auth management
```

## 📝 Modified Files

```
frontend/src/pages/
├── SignIn.jsx                        # API-integrated login
└── AdminDashboard.jsx                # Complete user management
```

---

## 🔒 Security Features

### Frontend
- Token-based authentication
- Automatic token inclusion in requests
- Role-based navigation
- Session persistence via localStorage
- Logout clears all user data

### Backend (Already Implemented)
- JWT token verification
- Role-based access control
- Password hashing
- Protected routes
- User activation/deactivation

---

## 🎯 Testing Checklist

### Login
- [ ] Can login with valid credentials
- [ ] Error shown for invalid credentials
- [ ] Redirects to correct dashboard based on role
- [ ] Token stored in localStorage
- [ ] User data stored in localStorage

### Admin Dashboard
- [ ] Displays user statistics
- [ ] Can view all users
- [ ] Can filter users by role
- [ ] Can add new doctor with form
- [ ] Can add new patient with form
- [ ] Can add new pharmacist with form
- [ ] Auto-generated password is displayed
- [ ] Can activate/deactivate users
- [ ] Loading states work properly
- [ ] Error messages display correctly
- [ ] Can logout successfully

---

## 🐛 Troubleshooting

### "Failed to fetch" or Network Error
**Solution**: Make sure backend server is running on port 3001
```bash
cd backend/server
npm run dev
```

### "Not authorized" Error
**Solution**: Token may be expired or invalid
1. Logout and login again
2. Check if backend is running
3. Clear localStorage and try again

### CORS Errors
**Solution**: Backend already has CORS enabled. If you see CORS errors:
1. Check backend console for errors
2. Verify API_URL in frontend/.env matches backend URL
3. Restart both servers

### "User already exists"
**Solution**: Email is already registered. Use a different email or check existing users in MongoDB.

---

## 📚 Next Steps

### Recommended Enhancements
1. **Protected Routes**: Add route guards to prevent unauthorized access
2. **Password Change on First Login**: Detect `isFirstLogin` flag and prompt password change
3. **User Profile Management**: Allow users to update their own profiles
4. **Search and Pagination**: Add search and pagination for user lists
5. **Notifications**: Show toast notifications for success/error messages
6. **Form Validation**: Add client-side validation before API calls
7. **Loading Skeletons**: Replace spinners with skeleton screens
8. **Confirmation Dialogs**: Add confirmations for destructive actions

### Additional Features to Integrate
- Doctor Dashboard user management
- Patient dashboard with health records
- Pharmacist dashboard with prescriptions
- Appointment scheduling
- Medical records management
- Prescription management

---

## 📖 API Endpoints Reference

### Authentication
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatepassword` - Update password
- `POST /api/auth/logout` - Logout

### Admin
- `POST /api/admin/register` - Register new admin
- `GET /api/admin/users` - Get all users (with optional filters)
- `GET /api/admin/users/:id` - Get user by ID
- `PUT /api/admin/users/:id/activate` - Activate user
- `PUT /api/admin/users/:id/deactivate` - Deactivate user

### Doctor (used by Admin in this implementation)
- `POST /api/doctor/patients` - Add new patient
- `POST /api/doctor/doctors` - Add new doctor
- `POST /api/doctor/pharmacists` - Add new pharmacist
- `GET /api/doctor/patients` - Get all patients
- `GET /api/doctor/doctors` - Get all doctors
- `GET /api/doctor/pharmacists` - Get all pharmacists

---

## ✅ Integration Complete!

Your frontend is now fully integrated with the backend API. Users can:
1. Login with their credentials
2. Access role-specific dashboards
3. Admins can manage all users
4. Add new users with auto-generated passwords
5. Activate/deactivate users

**Start testing and building more features! 🚀**
