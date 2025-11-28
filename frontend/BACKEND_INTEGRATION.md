-- Active: 1735062798646@@127.0.0.1@3306@feedback_db
# Backend Integration Guide

This guide shows how to use the backend API in your frontend components.

## ✅ What's Already Integrated

The following files have been updated to work with your backend:

1. **`src/services/api.js`** - API service layer
2. **`src/services/authService.js`** - Authentication helper (already working)
3. **`src/pages/SignIn.jsx`** - Sign in page
4. **`src/pages/SignUp.jsx`** - Sign up page (admin only)

## 🔌 Backend Configuration

The frontend expects the backend to run on `http://localhost:5000`. You can change this by creating a `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

## 📚 API Usage Examples

### Authentication

#### Sign In (All Roles)
```javascript
import { authAPI } from '../services/api';
import authService from '../services/authService';

// Sign in
const handleLogin = async (email, password, role) => {
  try {
    const response = await authAPI.login(email, password, role);
    // response = { token: "...", user: { id, email, role } }
    
    authService.login(response.token, response.user);
    // Navigate to dashboard
  } catch (error) {
    console.error('Login failed:', error.message);
  }
};
```

#### Sign Up (Admin Only)
```javascript
// Register new admin
const handleSignUp = async (fullname, email, password) => {
  try {
    const response = await authAPI.signUp(fullname, email, password);
    // response = { token: "...", user: { id, email, role } }
    
    // Navigate to sign in
  } catch (error) {
    console.error('Sign up failed:', error.message);
  }
};
```

### Admin Operations

#### Add Doctor
```javascript
import { adminAPI } from '../services/api';

const addDoctor = async () => {
  try {
    const response = await adminAPI.addUser(
      'Dr. Jane Smith',           // fullname
      'doctor@example.com',       // email
      'password123',              // password
      'doctor',                   // role
      'Cardiology'                // specialization (optional for doctor)
    );
    
    console.log('Doctor added:', response);
  } catch (error) {
    console.error('Failed to add doctor:', error.message);
  }
};
```

#### Add Pharmacist
```javascript
const addPharmacist = async () => {
  try {
    const response = await adminAPI.addUser(
      'John Pharmacist',          // fullname
      'pharmacist@example.com',   // email
      'password123',              // password
      'pharmacist'                // role
    );
    
    console.log('Pharmacist added:', response);
  } catch (error) {
    console.error('Failed to add pharmacist:', error.message);
  }
};
```

#### Remove Doctor or Pharmacist
```javascript
const removeUser = async (userId, role) => {
  try {
    const response = await adminAPI.removeUser(userId, role);
    console.log('User removed:', response);
  } catch (error) {
    console.error('Failed to remove user:', error.message);
  }
};
```

### Doctor Operations

#### Get My Patients
```javascript
import { doctorAPI } from '../services/api';

const loadPatients = async () => {
  try {
    const patients = await doctorAPI.getMyPatients();
    console.log('My patients:', patients);
    // patients is an array of patient objects
  } catch (error) {
    console.error('Failed to load patients:', error.message);
  }
};
```

#### Add Patient
```javascript
const addPatient = async () => {
  try {
    const response = await doctorAPI.addPatient(
      'Alice Patient',            // fullname
      'patient@example.com',      // email
      'password123'               // password
    );
    
    console.log('Patient added:', response);
  } catch (error) {
    console.error('Failed to add patient:', error.message);
  }
};
```

#### Remove Patient
```javascript
const removePatient = async (patientId) => {
  try {
    const response = await doctorAPI.removePatient(patientId);
    console.log('Patient removed:', response);
  } catch (error) {
    console.error('Failed to remove patient:', error.message);
  }
};
```

## 🎯 Example: Update AdminDashboard.jsx

Here's how to integrate the admin API into your AdminDashboard:

```javascript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import authService from '../services/authService';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Form state for adding users
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: '',
        role: 'doctor',
        specialization: ''
    });

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            navigate('/sign-in');
            return;
        }
        setUser(currentUser);
    }, [navigate]);

    const handleAddUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await adminAPI.addUser(
                formData.fullname,
                formData.email,
                formData.password,
                formData.role,
                formData.specialization
            );
            
            setSuccess(`${formData.role} added successfully!`);
            // Reset form
            setFormData({
                fullname: '',
                email: '',
                password: '',
                role: 'doctor',
                specialization: ''
            });
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveUser = async (userId, role) => {
        if (!window.confirm(`Are you sure you want to remove this ${role}?`)) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            await adminAPI.removeUser(userId, role);
            setSuccess(`${role} removed successfully!`);
            // Reload your user list here
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Your dashboard UI here */}
            <h1>Admin Dashboard</h1>
            
            {error && <div className="text-red-600">{error}</div>}
            {success && <div className="text-green-600">{success}</div>}
            
            <form onSubmit={handleAddUser}>
                <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.fullname}
                    onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                    <option value="doctor">Doctor</option>
                    <option value="pharmacist">Pharmacist</option>
                </select>
                
                {formData.role === 'doctor' && (
                    <input
                        type="text"
                        placeholder="Specialization"
                        value={formData.specialization}
                        onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    />
                )}
                
                <button type="submit" disabled={loading}>
                    {loading ? 'Adding...' : 'Add User'}
                </button>
            </form>
        </div>
    );
};
```

## 🎯 Example: Update DoctorDashboard.jsx

```javascript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorAPI } from '../services/api';
import authService from '../services/authService';

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser || currentUser.role !== 'doctor') {
            navigate('/sign-in');
            return;
        }
        setUser(currentUser);
        loadPatients();
    }, [navigate]);

    const loadPatients = async () => {
        setLoading(true);
        try {
            const data = await doctorAPI.getMyPatients();
            setPatients(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPatient = async (fullname, email, password) => {
        setLoading(true);
        try {
            await doctorAPI.addPatient(fullname, email, password);
            await loadPatients(); // Reload the list
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <h1>Doctor Dashboard</h1>
            
            {error && <div className="text-red-600">{error}</div>}
            
            <div>
                <h2>My Patients ({patients.length})</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <ul>
                        {patients.map(patient => (
                            <li key={patient._id}>
                                {patient.name} - {patient.email}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};
```

## 🔐 Authentication Flow

1. User signs in → `authAPI.login()` → Returns `{ token, user }`
2. Store in localStorage → `authService.login(token, user)`
3. Token is automatically included in subsequent API calls via `getToken()`
4. Navigate to appropriate dashboard based on user role

## 🚀 Running the Application

### Start Backend
```bash
cd backend
npm install
npm start
```
Backend runs on `http://localhost:5000`

### Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173` (or similar)

## 📝 Notes

- All API calls use simple error handling with try-catch
- Token is automatically retrieved from localStorage for authenticated requests
- The backend expects the token in the request body (not in Authorization header)
- All responses follow the backend's response format

## ⚠️ Important

- Passwords are hashed by the backend (bcrypt)
- JWT tokens expire in 1 day
- Only admins can create doctor and pharmacist accounts
- Only doctors can create patient accounts
- Doctors can only remove patients they created
