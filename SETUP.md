# Health-Track Setup Guide

This guide will help you set up and run the Health-Track application with the backend and frontend integrated.

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/abhinavkumar2369/Health-Track.git
cd Health-Track
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your settings
# Set PORT, MONGO_URI, and JWT_SECRET
nano .env  # or use your preferred editor

# Start the backend server
npm start
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file (optional, defaults to localhost:5000)
cp .env.example .env

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173` (or similar)

## 🔧 Configuration

### Backend (.env)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/health-track
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000
```

## 📝 Testing the Integration

### 1. Create an Admin Account

1. Open `http://localhost:5173` in your browser
2. Click "Sign Up"
3. Fill in the admin details:
   - Full Name: Admin User
   - Email: admin@example.com
   - Password: (strong password)
4. Click "Create Account"

### 2. Sign In

1. Go to Sign In page
2. Enter credentials:
   - Email: admin@example.com
   - Password: (your password)
   - Role: Admin
3. Click "Sign In"

### 3. Add a Doctor (Admin Dashboard)

Once logged in as admin:
1. Use the admin interface to add a doctor
2. Required fields:
   - Full Name: Dr. Jane Smith
   - Email: doctor@example.com
   - Password: password123
   - Role: Doctor
   - Specialization: Cardiology

### 4. Add a Patient (Doctor Dashboard)

1. Sign out and sign in as the doctor
2. Use the doctor interface to add a patient
3. Required fields:
   - Full Name: John Patient
   - Email: patient@example.com
   - Password: password123

## 🎯 API Endpoints

### Authentication
- `POST /auth/sign-up` - Admin registration
- `POST /auth/sign-in` - Login for all roles

### Admin
- `POST /admin/add-user` - Add doctor or pharmacist
- `DELETE /admin/remove-user/:id` - Remove doctor or pharmacist

### Doctor
- `GET /doctor/my-patients?token=TOKEN` - Get doctor's patients
- `POST /doctor/add-patient` - Add new patient
- `DELETE /doctor/remove-patient/:id` - Remove patient

## 🔐 User Roles

1. **Admin**
   - Can create doctors and pharmacists
   - Full system access
   - Created via Sign Up page

2. **Doctor**
   - Created by admin
   - Can add/remove patients
   - View their patients

3. **Patient**
   - Created by doctor
   - Linked to a doctor
   - View their information

4. **Pharmacist**
   - Created by admin
   - Manage inventory (future feature)

## 📁 Project Structure

```
Health-Track/
├── backend/
│   ├── db.js                 # Database connection
│   ├── server.js             # Express server
│   ├── package.json          # Dependencies
│   ├── .env.example          # Environment template
│   ├── middleware/
│   │   └── authMiddleware.js # JWT auth (optional)
│   ├── models/
│   │   ├── Admin.js          # Admin schema
│   │   ├── Doctor.js         # Doctor schema
│   │   ├── Patient.js        # Patient schema
│   │   └── Pharmacist.js     # Pharmacist schema
│   └── routes/
│       ├── authRoutes.js     # Auth endpoints
│       ├── adminRoutes.js    # Admin endpoints
│       └── doctorRoutes.js   # Doctor endpoints
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── pages/
    │   │   ├── SignIn.jsx            # ✅ Integrated
    │   │   ├── SignUp.jsx            # ✅ Integrated
    │   │   ├── AdminDashboard.jsx    # Ready for integration
    │   │   ├── DoctorDashboard.jsx   # Ready for integration
    │   │   ├── PatientDashboard.jsx
    │   │   └── PharmacistDashboard.jsx
    │   └── services/
    │       ├── api.js                # ✅ Backend API service
    │       └── authService.js        # ✅ Auth helper
    ├── package.json
    └── .env.example

```

## 🧪 Testing the API

### Using cURL

**Sign In:**
```bash
curl -X POST http://localhost:5000/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123",
    "role": "admin"
  }'
```

**Add Doctor (Admin):**
```bash
curl -X POST http://localhost:5000/admin/add-user \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_ADMIN_TOKEN",
    "fullname": "Dr. Jane Smith",
    "email": "doctor@example.com",
    "password": "password123",
    "role": "doctor",
    "specialization": "Cardiology"
  }'
```

**Get Patients (Doctor):**
```bash
curl -X GET "http://localhost:5000/doctor/my-patients?token=YOUR_DOCTOR_TOKEN"
```

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
- Make sure MongoDB is running
- Check MONGO_URI in .env file
- For local MongoDB: `mongodb://localhost:27017/health-track`
- For MongoDB Atlas: Use your connection string

**Port Already in Use:**
```bash
# Change PORT in backend/.env to a different port (e.g., 5001)
PORT=5001
```

**Module Not Found:**
```bash
cd backend
npm install
```

### Frontend Issues

**API Connection Error:**
- Verify backend is running on http://localhost:5000
- Check VITE_API_URL in frontend/.env
- Check browser console for CORS errors

**Build Error:**
```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

## 📚 Documentation

- [Backend API Documentation](backend/README.md) - Complete API reference
- [Frontend Integration Guide](frontend/BACKEND_INTEGRATION.md) - How to use the API

## 🔄 Development Workflow

1. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

2. **Start Backend** (Terminal 1)
   ```bash
   cd backend
   npm start
   ```

3. **Start Frontend** (Terminal 2)
   ```bash
   cd frontend
   npm run dev
   ```

4. **Make Changes**
   - Backend changes auto-reload with nodemon
   - Frontend changes auto-reload with Vite

## ✅ Integration Checklist

- [x] Backend API created
- [x] Frontend API service updated
- [x] Authentication integrated
- [x] Sign In page integrated
- [x] Sign Up page integrated
- [ ] Admin Dashboard - add user integration
- [ ] Admin Dashboard - remove user integration
- [ ] Doctor Dashboard - patient list integration
- [ ] Doctor Dashboard - add patient integration
- [ ] Patient Dashboard - view doctor integration
- [ ] Pharmacist Dashboard - inventory integration

## 🚀 Next Steps

1. **Complete Dashboard Integration**: Update AdminDashboard and DoctorDashboard to use the API
2. **Add Error Handling**: Improve user feedback for errors
3. **Add Loading States**: Show spinners during API calls
4. **Add Validation**: Client-side form validation
5. **Add Features**: Implement remaining backend routes
6. **Testing**: Add unit and integration tests
7. **Deployment**: Deploy to production

## 📞 Support

For issues or questions:
- Check the [Backend API Documentation](backend/README.md)
- Check the [Frontend Integration Guide](frontend/BACKEND_INTEGRATION.md)
- Review the code examples in the guides

## 📄 License

Apache-2.0

## 👤 Author

Abhinav Kumar
