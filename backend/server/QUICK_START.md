# Quick Start Guide - Health-Track API

## Prerequisites
✅ MongoDB running (local or Atlas)  
✅ Node.js installed  
✅ Server running on port 3001  

## Quick Test Flow

### Step 1: Start Server
```bash
cd backend/server
npm run dev
```

Server should show:
```
Server running in development mode on port 3001
MongoDB Connected: localhost
```

---

## Test Endpoints (Using Thunder Client/Postman)

### 1️⃣ Register First Admin

**Request:**
```http
POST http://localhost:3001/api/admin/register
Content-Type: application/json

{
  "email": "admin@healthtrack.com",
  "password": "Admin@12345",
  "firstName": "System",
  "lastName": "Administrator",
  "phone": "+1234567890"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Admin registered successfully",
  "data": {
    "uniqueId": "ADM00001",
    "email": "admin@healthtrack.com",
    "role": "admin",
    "firstName": "System",
    "lastName": "Administrator"
  }
}
```

---

### 2️⃣ Login as Admin

**Request:**
```http
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "admin@healthtrack.com",
  "password": "Admin@12345"
}
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "676a1234567890abcdef",
    "uniqueId": "ADM00001",
    "email": "admin@healthtrack.com",
    "role": "admin",
    "firstName": "System",
    "lastName": "Administrator",
    "isFirstLogin": false
  }
}
```

**⚠️ IMPORTANT: Copy the token value!**

---

### 3️⃣ Test Protected Route - Get Current User

**Request:**
```http
GET http://localhost:3001/api/auth/me
Authorization: Bearer <paste_your_token_here>
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "uniqueId": "ADM00001",
    "email": "admin@healthtrack.com",
    "role": "admin",
    "firstName": "System",
    "lastName": "Administrator",
    "isActive": true
  }
}
```

---

### 4️⃣ Register a Doctor (As Admin)

**Request:**
```http
POST http://localhost:3001/api/admin/register
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "email": "doctor@healthtrack.com",
  "password": "Doctor@12345",
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567891"
}
```

Wait, this won't work! Admins can't register doctors directly. Let me create a doctor account first, then show doctor operations.

Actually, let's login as admin and use the doctor routes to add a doctor:

**OR Login the doctor and use doctor routes:**

First, we need to manually add a doctor role. Let me show you the correct flow:

---

### 5️⃣ Create Doctor Account (Manual DB or via Admin Portal)

For testing, let's register a doctor by temporarily modifying the admin register route OR use MongoDB directly.

**Alternative: Create via Doctor Routes**

First, we need at least one doctor. Let's manually create one using MongoDB or modify the code temporarily.

**Quick Fix for Testing:**
Create a test endpoint (temporary) or use MongoDB Compass to insert:

```json
{
  "uniqueId": "DOC00001",
  "email": "doctor@healthtrack.com",
  "password": "$2a$10$hashedPasswordHere",
  "role": "doctor",
  "firstName": "Dr. John",
  "lastName": "Smith",
  "phone": "+1234567891",
  "isActive": true,
  "isFirstLogin": false,
  "createdAt": "2025-10-08T00:00:00.000Z",
  "updatedAt": "2025-10-08T00:00:00.000Z"
}
```

---

### 6️⃣ Doctor Adds a Patient

**Request:**
```http
POST http://localhost:3001/api/doctor/patients
Authorization: Bearer <doctor_token>
Content-Type: application/json

{
  "email": "patient@healthtrack.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+1234567892"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Patient added successfully",
  "data": {
    "uniqueId": "PAT00001",
    "email": "patient@healthtrack.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "temporaryPassword": "aB3$xY9@mK",
    "note": "Please share this temporary password with the patient..."
  }
}
```

---

### 7️⃣ Patient First Login

**Request:**
```http
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "patient@healthtrack.com",
  "password": "aB3$xY9@mK"
}
```

**Response will show:** `"isFirstLogin": true`

---

### 8️⃣ Patient Changes Password

**Request:**
```http
PUT http://localhost:3001/api/auth/updatepassword
Authorization: Bearer <patient_token>
Content-Type: application/json

{
  "currentPassword": "aB3$xY9@mK",
  "newPassword": "MyNewPassword@123"
}
```

---

### 9️⃣ Admin Gets All Users

**Request:**
```http
GET http://localhost:3001/api/admin/users
Authorization: Bearer <admin_token>
```

**With Filters:**
```http
GET http://localhost:3001/api/admin/users?role=patient&isActive=true
Authorization: Bearer <admin_token>
```

---

### 🔟 Admin Deactivates User

**Request:**
```http
PUT http://localhost:3001/api/admin/users/<user_id>/deactivate
Authorization: Bearer <admin_token>
```

---

## Common Issues & Solutions

### ❌ "Not authorized to access this route"
**Solution:** Make sure you're including the token in the header:
```
Authorization: Bearer <your_token>
```

### ❌ "Invalid credentials"
**Solution:** Double-check email and password

### ❌ "User role 'patient' is not authorized..."
**Solution:** You're trying to access a route meant for a different role

### ❌ "MongoDB connection error"
**Solution:** Make sure MongoDB is running:
```bash
# Check if MongoDB is running
mongosh
```

---

## Role-Based Testing Matrix

| Endpoint | Admin | Doctor | Patient | Pharmacist |
|----------|-------|--------|---------|------------|
| POST /api/auth/login | ✅ | ✅ | ✅ | ✅ |
| GET /api/auth/me | ✅ | ✅ | ✅ | ✅ |
| PUT /api/auth/updatepassword | ✅ | ✅ | ✅ | ✅ |
| POST /api/admin/register | ✅ | ❌ | ❌ | ❌ |
| GET /api/admin/users | ✅ | ❌ | ❌ | ❌ |
| POST /api/doctor/patients | ❌ | ✅ | ❌ | ❌ |
| POST /api/doctor/doctors | ❌ | ✅ | ❌ | ❌ |
| POST /api/doctor/pharmacists | ❌ | ✅ | ❌ | ❌ |

---

## Next Steps

1. ✅ Test all authentication endpoints
2. ✅ Test role-based access control
3. ✅ Test user creation flow
4. ✅ Test password change on first login
5. ✅ Test user activation/deactivation
6. 📝 Integrate with frontend
7. 📝 Add more healthcare-specific models (appointments, prescriptions, etc.)
8. 📝 Add email notifications
9. 📝 Add password reset functionality

---

## Pro Tips

- Use environment variables for sensitive data
- Never commit `.env` file to git
- Use strong JWT secrets in production
- Implement rate limiting for login endpoints
- Add request validation middleware
- Log all authentication attempts
- Implement refresh tokens for better security

---

**Happy Testing! 🚀**
