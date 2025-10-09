# 🚀 Quick Start - Admin Signup

## ✅ System Status
- Backend: `http://localhost:3001` ✅
- Frontend: `http://localhost:5174` ✅
- MongoDB: Connected ✅

---

## 📋 Step-by-Step

### 1️⃣ Create Admin Account
**URL**: `http://localhost:5174/sign-up`

**Fill the form**:
- First Name: `John`
- Last Name: `Admin`
- Email: `admin@test.com`
- Password: `Admin@123`
- Confirm Password: `Admin@123`
- Phone: `+1234567890` (optional)

**Password must have**:
- ✅ At least 8 characters
- ✅ One uppercase (A-Z)
- ✅ One lowercase (a-z)
- ✅ One number (0-9)
- ✅ One special (!@#$%^&*)

**Click**: "Create Account"

**Result**: You'll see "Your ID: ADM00001"

---

### 2️⃣ Sign In
**URL**: `http://localhost:5174/sign-in`

**Enter**:
- Email: `admin@test.com`
- Password: `Admin@123`

**Click**: "Sign In"

**Result**: Redirected to Admin Dashboard

---

### 3️⃣ Add Users

**From Dashboard**:
- Click "Add Doctor" / "Add Patient" / "Add Pharmacist"
- Fill in:
  - Email: `doctor1@test.com`
  - First Name: `Test`
  - Last Name: `Doctor`
  - Phone: `+1234567890` (optional)
- Click "Add User"

**Result**: 
- ✅ User created
- 🔑 Temporary password shown (save it!)
- 📧 Share password with new user

---

## 🎯 What Happens

### When You Sign Up:
1. ✅ Data sent to MongoDB
2. ✅ Password hashed (bcrypt)
3. ✅ Unique ID created (ADM00001)
4. ✅ Account saved in database
5. ✅ Redirect to sign-in page

### When You Sign In:
1. ✅ Email & password verified
2. ✅ JWT token created
3. ✅ Token saved in browser
4. ✅ User data saved
5. ✅ Redirect to dashboard

### When You Add User:
1. ✅ Auto-generate unique ID
2. ✅ Create random password
3. ✅ Save to MongoDB
4. ✅ Show password to admin
5. ✅ Add to user list

---

## 🔑 Test Credentials

**Admin Account** (Create via Signup):
```
Email: admin@test.com
Password: Admin@123
ID: ADM00001
```

**Or use seed data** (`npm run seed`):
```
Admin: admin@healthtrack.com / Admin@12345
Doctor: doctor@healthtrack.com / Doctor@12345
Patient: patient@healthtrack.com / Patient@12345
Pharmacist: pharmacist@healthtrack.com / Pharmacist@12345
```

---

## 🎨 Features

### Admin Can:
- ✅ Sign up (first admin only)
- ✅ Sign in
- ✅ View all users
- ✅ Add doctors
- ✅ Add patients
- ✅ Add pharmacists
- ✅ Activate/deactivate users
- ✅ See statistics

### Auto-Generated:
- ✅ Unique IDs (ADM00001, DOC00001, PAT00001, PHR00001)
- ✅ Random passwords (10 chars)
- ✅ JWT tokens
- ✅ Password hashing

---

## ⚠️ Troubleshooting

**"Email already exists"**
→ Use different email or sign in

**"Not authorized"**
→ Sign in again

**"Password requirements not met"**
→ Check: 8 chars, uppercase, lowercase, number, special char

**Frontend not loading**
→ Go to: `http://localhost:5174`

**Backend not responding**
→ Restart: `cd backend\server; npm run dev`

---

## 📱 URLs

- Homepage: `http://localhost:5174/`
- Sign Up: `http://localhost:5174/sign-up`
- Sign In: `http://localhost:5174/sign-in`
- Admin Dashboard: `http://localhost:5174/admin-dashboard`

---

## 🎉 You're Ready!

**Start here**: http://localhost:5174/sign-up

Create your admin account and start managing users! 🚀
