# Admin Signup & User Management Guide

## ✅ Current Status
- **Backend**: Running on `http://localhost:3001` ✅
- **Frontend**: Running on `http://localhost:5174` ✅
- **MongoDB**: Connected ✅

---

## 📝 Step 1: Create Admin Account

1. **Open your browser** and go to:
   ```
   http://localhost:5174/sign-up
   ```

2. **Fill in the form**:
   - **First Name**: Your first name (e.g., "John")
   - **Last Name**: Your last name (e.g., "Doe")
   - **Email**: Your email (e.g., "admin@example.com")
   - **Password**: Must meet requirements:
     - ✅ At least 8 characters
     - ✅ One uppercase letter
     - ✅ One lowercase letter
     - ✅ One number
     - ✅ One special character (!@#$%^&*(),.?":{}|<>)
   - **Confirm Password**: Same as password
   - **Phone**: (Optional) Your phone number

3. **Example Password**: `Admin@123`

4. **Click "Create Account"**

5. **You'll see a success message** with:
   - Your unique Admin ID (e.g., `ADM00001`)
   - Message to sign in

---

## 🔐 Step 2: Sign In

1. **You'll be redirected to**: `http://localhost:5174/sign-in`

2. **Enter your credentials**:
   - **Email**: The email you just registered
   - **Password**: The password you created

3. **Click "Sign In"**

4. **You'll be redirected to** the Admin Dashboard

---

## 👥 Step 3: Add Users (Doctors, Patients, Pharmacists)

### From Admin Dashboard:

1. **Navigate to the tabs**:
   - 📋 **Overview** - See all users
   - 👨‍⚕️ **Doctors** - Add/manage doctors
   - 🏥 **Patients** - Add/manage patients
   - 💊 **Pharmacists** - Add/manage pharmacists

2. **To add a new user**:
   - Click the **"Add Doctor"** / **"Add Patient"** / **"Add Pharmacist"** button
   - Fill in the form:
     - Email
     - First Name
     - Last Name
     - Phone (optional)
   - Click **"Add User"**

3. **Success!** You'll see:
   - ✅ User added successfully
   - 🔑 **Temporary Password** - Save this!
   - Share the temporary password with the new user

4. **User Details Created**:
   - Unique ID: Auto-generated (DOC00001, PAT00001, PHR00001)
   - Email: As provided
   - Password: Auto-generated (10 characters)
   - First Login: User must change password on first login

---

## 🔍 Features Available

### Admin Can:
- ✅ Create admin account (signup)
- ✅ Sign in to admin dashboard
- ✅ View all users
- ✅ Add new doctors
- ✅ Add new patients
- ✅ Add new pharmacists
- ✅ Activate/Deactivate users
- ✅ See user statistics

### Auto-Generated:
- ✅ Unique IDs (ADM00001, DOC00001, PAT00001, PHR00001)
- ✅ Random passwords (10 characters with special chars)
- ✅ Password hashing (bcrypt)
- ✅ JWT tokens for authentication

---

## 🎯 Quick Test Flow

### 1. Create Admin Account
```
Email: admin@test.com
Password: Admin@123
```

### 2. Sign In
```
Email: admin@test.com
Password: Admin@123
```

### 3. Add a Doctor
```
Email: doctor@test.com
First Name: Test
Last Name: Doctor
```

### 4. Get Temporary Password
```
Copy the temporary password shown (e.g., "aB3$dE7!xZ")
```

### 5. Doctor Can Sign In
```
Email: doctor@test.com
Password: [temporary password]
```

---

## ⚠️ Important Notes

1. **Only ONE admin can sign up** initially
   - The signup page is for the first admin
   - Additional admins must be added by existing admins

2. **Password Requirements**:
   - Minimum 8 characters
   - Must include: uppercase, lowercase, number, special character

3. **Temporary Passwords**:
   - Generated automatically for doctors/patients/pharmacists
   - User must change on first login
   - 10 characters long with special characters

4. **Unique IDs**:
   - Auto-generated and sequential
   - Format: PREFIX + 5 digits (e.g., DOC00001)
   - Cannot be changed

5. **Database**:
   - All data stored in MongoDB
   - Located at: `mongodb://localhost:27017/health-track`

---

## 🔧 Troubleshooting

### "Not authorized" error?
- Make sure you're signed in
- Check that you're using admin account
- Clear browser cache and try again

### Frontend not loading?
- Check if running on: `http://localhost:5174`
- If port changed, check terminal output

### Backend not responding?
- Check if running on: `http://localhost:3001`
- Check MongoDB is running
- Restart backend: `cd backend\server; npm run dev`

### Cannot create admin?
- Check if MongoDB is running
- Check network tab in browser for errors
- Make sure password meets requirements

---

## 🎉 Success Checklist

- [ ] Backend running on port 3001
- [ ] Frontend running on port 5174
- [ ] MongoDB connected
- [ ] Created admin account via signup
- [ ] Signed in as admin
- [ ] Admin dashboard loaded
- [ ] Added a test doctor
- [ ] Received temporary password
- [ ] Can see users in dashboard

---

## 📊 Database Structure

```
health-track (database)
  └── users (collection)
      ├── Admin (role: 'admin')
      ├── Doctors (role: 'doctor')
      ├── Patients (role: 'patient')
      └── Pharmacists (role: 'pharmacist')
```

Each user has:
- uniqueId (string) - Auto-generated
- email (string) - Unique
- password (string) - Hashed
- role (string) - admin/doctor/patient/pharmacist
- firstName (string)
- lastName (string)
- phone (string) - Optional
- isActive (boolean) - Default true
- isFirstLogin (boolean) - Default true
- createdBy (ObjectId) - Who created this user
- createdAt (Date)
- updatedAt (Date)

---

**🚀 You're all set! Start by creating your admin account at:**
**http://localhost:5174/sign-up**
