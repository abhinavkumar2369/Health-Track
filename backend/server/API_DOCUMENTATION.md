# Health-Track Backend API Documentation

## Overview
This is a JWT-based authentication API for the Health-Track healthcare management system with role-based access control (RBAC).

## Base URL
```
http://localhost:3001/api
```

## Roles
- **Admin**: Full system access, can manage all users
- **Doctor**: Can add patients, doctors, and pharmacists
- **Patient**: Access to personal health records
- **Pharmacist**: Access to prescriptions and medications

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## API Endpoints

### 1. Authentication Routes (`/api/auth`)

#### Login
```http
POST /api/auth/login
```
**Access**: Public  
**Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response**:
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "uniqueId": "DOC00001",
    "email": "user@example.com",
    "role": "doctor",
    "firstName": "John",
    "lastName": "Doe",
    "isFirstLogin": false
  }
}
```

#### Get Current User
```http
GET /api/auth/me
```
**Access**: Private (All authenticated users)  
**Headers**: `Authorization: Bearer <token>`  
**Response**:
```json
{
  "success": true,
  "data": {
    "uniqueId": "DOC00001",
    "email": "user@example.com",
    "role": "doctor",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### Update Password
```http
PUT /api/auth/updatepassword
```
**Access**: Private (All authenticated users)  
**Headers**: `Authorization: Bearer <token>`  
**Body**:
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```
**Response**:
```json
{
  "success": true,
  "token": "new_jwt_token",
  "message": "Password updated successfully"
}
```

#### Logout
```http
POST /api/auth/logout
```
**Access**: Private (All authenticated users)  
**Headers**: `Authorization: Bearer <token>`  
**Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 2. Admin Routes (`/api/admin`)

#### Register Admin
```http
POST /api/admin/register
```
**Access**: Public (for first admin) / Private (Admin only for subsequent)  
**Body**:
```json
{
  "email": "admin@healthtrack.com",
  "password": "securePassword123",
  "firstName": "Admin",
  "lastName": "User",
  "phone": "+1234567890"
}
```
**Response**:
```json
{
  "success": true,
  "message": "Admin registered successfully",
  "data": {
    "uniqueId": "ADM00001",
    "email": "admin@healthtrack.com",
    "role": "admin",
    "firstName": "Admin",
    "lastName": "User"
  }
}
```

#### Get All Users
```http
GET /api/admin/users?role=doctor&isActive=true
```
**Access**: Private (Admin only)  
**Headers**: `Authorization: Bearer <token>`  
**Query Parameters**:
- `role` (optional): Filter by role (admin, doctor, patient, pharmacist)
- `isActive` (optional): Filter by active status (true/false)

**Response**:
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "uniqueId": "DOC00001",
      "email": "doctor@example.com",
      "role": "doctor",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": true
    }
  ]
}
```

#### Get Single User
```http
GET /api/admin/users/:id
```
**Access**: Private (Admin only)  
**Headers**: `Authorization: Bearer <token>`  
**Response**:
```json
{
  "success": true,
  "data": {
    "uniqueId": "PAT00001",
    "email": "patient@example.com",
    "role": "patient",
    "firstName": "Jane",
    "lastName": "Smith",
    "isActive": true
  }
}
```

#### Deactivate User
```http
PUT /api/admin/users/:id/deactivate
```
**Access**: Private (Admin only)  
**Headers**: `Authorization: Bearer <token>`  
**Response**:
```json
{
  "success": true,
  "message": "User deactivated successfully"
}
```

#### Activate User
```http
PUT /api/admin/users/:id/activate
```
**Access**: Private (Admin only)  
**Headers**: `Authorization: Bearer <token>`  
**Response**:
```json
{
  "success": true,
  "message": "User activated successfully"
}
```

---

### 3. Doctor Routes (`/api/doctor`)

#### Add Patient
```http
POST /api/doctor/patients
```
**Access**: Private (Doctor only)  
**Headers**: `Authorization: Bearer <token>`  
**Body**:
```json
{
  "email": "patient@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1234567890"
}
```
**Response**:
```json
{
  "success": true,
  "message": "Patient added successfully",
  "data": {
    "uniqueId": "PAT00001",
    "email": "patient@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "temporaryPassword": "aB3$xY9@mK",
    "note": "Please share this temporary password with the patient. They will be required to change it on first login."
  }
}
```

#### Add Doctor
```http
POST /api/doctor/doctors
```
**Access**: Private (Doctor only)  
**Headers**: `Authorization: Bearer <token>`  
**Body**:
```json
{
  "email": "newdoctor@example.com",
  "firstName": "Robert",
  "lastName": "Johnson",
  "phone": "+1234567890"
}
```
**Response**:
```json
{
  "success": true,
  "message": "Doctor added successfully",
  "data": {
    "uniqueId": "DOC00002",
    "email": "newdoctor@example.com",
    "firstName": "Robert",
    "lastName": "Johnson",
    "temporaryPassword": "xY9@mKaB3$",
    "note": "Please share this temporary password with the doctor. They will be required to change it on first login."
  }
}
```

#### Add Pharmacist
```http
POST /api/doctor/pharmacists
```
**Access**: Private (Doctor only)  
**Headers**: `Authorization: Bearer <token>`  
**Body**:
```json
{
  "email": "pharmacist@example.com",
  "firstName": "Sarah",
  "lastName": "Williams",
  "phone": "+1234567890"
}
```
**Response**:
```json
{
  "success": true,
  "message": "Pharmacist added successfully",
  "data": {
    "uniqueId": "PHR00001",
    "email": "pharmacist@example.com",
    "firstName": "Sarah",
    "lastName": "Williams",
    "temporaryPassword": "mKaB3$xY9@",
    "note": "Please share this temporary password with the pharmacist. They will be required to change it on first login."
  }
}
```

#### Get All Patients
```http
GET /api/doctor/patients
```
**Access**: Private (Doctor only)  
**Headers**: `Authorization: Bearer <token>`  
**Response**:
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "uniqueId": "PAT00001",
      "email": "patient@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "isActive": true
    }
  ]
}
```

#### Get All Doctors
```http
GET /api/doctor/doctors
```
**Access**: Private (Doctor only)  
**Headers**: `Authorization: Bearer <token>`

#### Get All Pharmacists
```http
GET /api/doctor/pharmacists
```
**Access**: Private (Doctor only)  
**Headers**: `Authorization: Bearer <token>`

---

## Unique ID Format
- **Admin**: `ADM00001`, `ADM00002`, ...
- **Doctor**: `DOC00001`, `DOC00002`, ...
- **Patient**: `PAT00001`, `PAT00002`, ...
- **Pharmacist**: `PHR00001`, `PHR00002`, ...

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "User role 'patient' is not authorized to access this route"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Server Error"
}
```

---

## Setup Instructions

1. Install MongoDB locally or use MongoDB Atlas
2. Update `.env` file with your MongoDB URI and JWT secret
3. Install dependencies: `npm install`
4. Run development server: `npm run dev`
5. Run production server: `npm start`

## First Admin Registration
The first admin can be registered without authentication at:
```http
POST /api/admin/register
```

After the first admin is created, all subsequent admin registrations should be done by an authenticated admin.

---

## Testing with Postman/Thunder Client

### Step 1: Register First Admin
```
POST http://localhost:3001/api/admin/register
Body: { email, password, firstName, lastName, phone }
```

### Step 2: Login as Admin
```
POST http://localhost:3001/api/auth/login
Body: { email, password }
```
Save the returned token.

### Step 3: Use Token for Protected Routes
Add header: `Authorization: Bearer <token>`

---

## Security Features
- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control (RBAC)
- First login password change requirement
- User activation/deactivation
- Secure password validation
- Protected routes with middleware

---

## Future Enhancements
- Password reset functionality
- Email notifications for new user creation
- Two-factor authentication (2FA)
- Refresh token mechanism
- Rate limiting
- Input validation with Joi/Express-validator
- API documentation with Swagger
