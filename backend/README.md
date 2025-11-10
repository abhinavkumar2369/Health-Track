# Health-Track Backend API Documentation

## Table of Contents
- [Overview](#overview)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Models](#database-models)
- [API Routes](#api-routes)
  - [Authentication Routes](#authentication-routes)
  - [Admin Routes](#admin-routes)
  - [Doctor Routes](#doctor-routes)
- [Error Handling](#error-handling)

---

## Overview

Health-Track is a comprehensive healthcare management system backend built with Node.js, Express, and MongoDB. It supports role-based access control for Admins, Doctors, Patients, and Pharmacists.

**Tech Stack:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt.js for password hashing

---

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB instance
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start the server
npm start
```

The server will run on the port specified in your `.env` file.

---

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/health-track
JWT_SECRET=your_secret_key_here
```

---

## Database Models

### Admin
```javascript
{
  fullname: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (default: "admin"),
  createdAt: Date,
  updatedAt: Date
}
```

### Doctor
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  specialization: String,
  admin_id: ObjectId (ref: Admin, required),
  role: String (default: "doctor"),
  createdAt: Date,
  updatedAt: Date
}
```

### Patient
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  doctor_id: ObjectId (ref: Doctor, required),
  admin_id: ObjectId (ref: Admin),
  role: String (default: "patient"),
  createdAt: Date,
  updatedAt: Date
}
```

### Pharmacist
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  inventory: Array of Strings (default: []),
  admin_id: ObjectId (ref: Admin, required),
  role: String (default: "pharmacist"),
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Routes

Base URL: `http://localhost:5000`

---

## Authentication Routes

Base Path: `/auth`

### 1. Admin Sign Up

Creates a new admin account.

**Endpoint:** `POST /auth/sign-up`

**Request Body:**
```json
{
  "fullname": "John Doe",
  "email": "admin@example.com",
  "password": "securePassword123",
  "role": "admin"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Error Responses:**

- **400 Bad Request** - Only admin can sign up directly
```json
{
  "message": "Only admin can sign up directly"
}
```

- **400 Bad Request** - User already exists
```json
{
  "message": "User already exists"
}
```

- **500 Internal Server Error**
```json
{
  "message": "Error description"
}
```

---

### 2. Sign In (All Roles)

Authenticates users and returns a JWT token.

**Endpoint:** `POST /auth/sign-in`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "userPassword123",
  "role": "admin" // or "doctor", "patient", "pharmacist"
}
```

**Success Response (200):**

For Admin:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

For Doctor:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "email": "doctor@example.com",
    "role": "doctor"
  }
}
```

For Patient:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439013",
    "email": "patient@example.com",
    "role": "patient"
  }
}
```

For Pharmacist:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439014",
    "email": "pharmacist@example.com",
    "role": "pharmacist"
  }
}
```

**Error Responses:**

- **400 Bad Request** - Invalid role
```json
{
  "message": "Invalid role"
}
```

- **400 Bad Request** - User not found
```json
{
  "message": "User not found"
}
```

- **401 Unauthorized** - Invalid password
```json
{
  "message": "Invalid password"
}
```

- **500 Internal Server Error**
```json
{
  "message": "Error description"
}
```

---

## Admin Routes

Base Path: `/admin`

**Authentication:** All admin routes require a valid admin JWT token in the request body.

---

### 1. Add Doctor or Pharmacist

Allows admin to add a new doctor or pharmacist to the system.

**Endpoint:** `POST /admin/add-user`

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "fullname": "Dr. Jane Smith",
  "email": "doctor@example.com",
  "password": "securePassword123",
  "role": "doctor",
  "specialization": "Cardiology"
}
```

Or for Pharmacist:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "fullname": "John Pharmacist",
  "email": "pharmacist@example.com",
  "password": "securePassword123",
  "role": "pharmacist"
}
```

**Success Response (201):**

For Doctor:
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "name": "Dr. Jane Smith",
  "email": "doctor@example.com",
  "password": "$2a$10$...",
  "specialization": "Cardiology",
  "admin_id": "507f1f77bcf86cd799439011",
  "role": "doctor",
  "createdAt": "2025-11-10T12:00:00.000Z",
  "updatedAt": "2025-11-10T12:00:00.000Z"
}
```

For Pharmacist:
```json
{
  "_id": "507f1f77bcf86cd799439016",
  "name": "John Pharmacist",
  "email": "pharmacist@example.com",
  "password": "$2a$10$...",
  "inventory": [],
  "admin_id": "507f1f77bcf86cd799439011",
  "role": "pharmacist",
  "createdAt": "2025-11-10T12:00:00.000Z",
  "updatedAt": "2025-11-10T12:00:00.000Z"
}
```

**Error Responses:**

- **400 Bad Request** - Invalid role
```json
{
  "message": "Invalid role"
}
```

- **400 Bad Request** - User already exists
```json
{
  "message": "Doctor already exists"
}
```
or
```json
{
  "message": "Pharmacist already exists"
}
```

- **401 Unauthorized** - Token required
```json
{
  "message": "Access denied: token required"
}
```

- **401 Unauthorized** - Invalid token
```json
{
  "message": "Invalid or expired token"
}
```

- **403 Forbidden** - Not admin
```json
{
  "message": "Forbidden: admin only"
}
```

- **500 Internal Server Error**
```json
{
  "message": "Error description"
}
```

---

### 2. Remove Doctor or Pharmacist

Allows admin to remove a doctor or pharmacist from the system.

**Endpoint:** `DELETE /admin/remove-user/:id`

**URL Parameters:**
- `id` - The MongoDB ObjectId of the doctor or pharmacist to remove

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "doctor"  // or "pharmacist"
}
```

**Success Response (200):**

For Doctor:
```json
{
  "message": "Doctor removed successfully"
}
```

For Pharmacist:
```json
{
  "message": "Pharmacist removed successfully"
}
```

**Error Responses:**

- **400 Bad Request** - Invalid role
```json
{
  "message": "Invalid role provided"
}
```

- **401 Unauthorized** - Token required
```json
{
  "message": "Access denied: token required"
}
```

- **401 Unauthorized** - Invalid token
```json
{
  "message": "Invalid or expired token"
}
```

- **403 Forbidden** - Not admin
```json
{
  "message": "Forbidden: admin only"
}
```

- **500 Internal Server Error**
```json
{
  "message": "Error description"
}
```

---

## Doctor Routes

Base Path: `/doctor`

**Authentication:** All doctor routes require a valid doctor JWT token.

---

### 1. Get My Patients

Retrieves all patients linked to the authenticated doctor.

**Endpoint:** `GET /doctor/my-patients?token=YOUR_TOKEN`

**Query Parameters:**
- `token` - JWT token of the authenticated doctor

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "name": "Alice Patient",
    "email": "alice@example.com",
    "password": "$2a$10$...",
    "doctor_id": "507f1f77bcf86cd799439015",
    "admin_id": "507f1f77bcf86cd799439011",
    "role": "patient",
    "createdAt": "2025-11-10T12:00:00.000Z",
    "updatedAt": "2025-11-10T12:00:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439021",
    "name": "Bob Patient",
    "email": "bob@example.com",
    "password": "$2a$10$...",
    "doctor_id": "507f1f77bcf86cd799439015",
    "admin_id": "507f1f77bcf86cd799439011",
    "role": "patient",
    "createdAt": "2025-11-10T12:00:00.000Z",
    "updatedAt": "2025-11-10T12:00:00.000Z"
  }
]
```

**Error Responses:**

- **401 Unauthorized** - Token required
```json
{
  "message": "Access denied: token required"
}
```

- **401 Unauthorized** - Invalid token
```json
{
  "message": "Invalid or expired token"
}
```

- **403 Forbidden** - Not a doctor
```json
{
  "message": "Forbidden: doctor only"
}
```

- **500 Internal Server Error**
```json
{
  "message": "Error description"
}
```

---

### 2. Add Patient

Allows a doctor to add a new patient to their care.

**Endpoint:** `POST /doctor/add-patient`

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "fullname": "Alice Patient",
  "email": "alice@example.com",
  "password": "patientPassword123"
}
```

**Success Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439020",
  "name": "Alice Patient",
  "email": "alice@example.com",
  "password": "$2a$10$...",
  "doctor_id": "507f1f77bcf86cd799439015",
  "admin_id": "507f1f77bcf86cd799439011",
  "role": "patient",
  "createdAt": "2025-11-10T12:00:00.000Z",
  "updatedAt": "2025-11-10T12:00:00.000Z"
}
```

**Error Responses:**

- **400 Bad Request** - Patient already exists
```json
{
  "message": "Patient already exists"
}
```

- **401 Unauthorized** - Token required
```json
{
  "message": "Access denied: token required"
}
```

- **401 Unauthorized** - Invalid token
```json
{
  "message": "Invalid or expired token"
}
```

- **403 Forbidden** - Not a doctor
```json
{
  "message": "Forbidden: doctor only"
}
```

- **500 Internal Server Error**
```json
{
  "message": "Error description"
}
```

---

### 3. Remove Patient

Allows a doctor to remove a patient they added.

**Endpoint:** `DELETE /doctor/remove-patient/:id`

**URL Parameters:**
- `id` - The MongoDB ObjectId of the patient to remove

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "message": "Patient removed successfully"
}
```

**Error Responses:**

- **403 Forbidden** - Can only remove own patients
```json
{
  "message": "Forbidden: only the doctor who added can remove"
}
```

- **404 Not Found** - Patient not found
```json
{
  "message": "Patient not found"
}
```

- **401 Unauthorized** - Token required
```json
{
  "message": "Access denied: token required"
}
```

- **401 Unauthorized** - Invalid token
```json
{
  "message": "Invalid or expired token"
}
```

- **403 Forbidden** - Not a doctor
```json
{
  "message": "Forbidden: doctor only"
}
```

- **500 Internal Server Error**
```json
{
  "message": "Error description"
}
```

---

## Error Handling

All routes implement try-catch error handling and return appropriate HTTP status codes:

- `200` - Success
- `201` - Created successfully
- `400` - Bad Request (validation errors, duplicates)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## JWT Token Structure

Tokens are signed with the `JWT_SECRET` and expire in 1 day. The payload structure varies by role:

**Admin Token Payload:**
```javascript
{
  id: "507f1f77bcf86cd799439011",
  email: "admin@example.com",
  role: "admin"
}
```

**Doctor Token Payload:**
```javascript
{
  id: "507f1f77bcf86cd799439015",
  email: "doctor@example.com",
  role: "doctor",
  admin_id: "507f1f77bcf86cd799439011"
}
```

**Patient Token Payload:**
```javascript
{
  id: "507f1f77bcf86cd799439020",
  email: "patient@example.com",
  role: "patient",
  doctor_id: "507f1f77bcf86cd799439015",
  admin_id: "507f1f77bcf86cd799439011"
}
```

**Pharmacist Token Payload:**
```javascript
{
  id: "507f1f77bcf86cd799439016",
  email: "pharmacist@example.com",
  role: "pharmacist",
  admin_id: "507f1f77bcf86cd799439011"
}
```

---

## Testing the API

You can test the API using tools like:
- Postman
- cURL
- Thunder Client (VS Code Extension)
- Insomnia

### Example cURL Request

**Sign In:**
```bash
curl -X POST http://localhost:5000/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "securePassword123",
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
    "password": "securePassword123",
    "role": "doctor",
    "specialization": "Cardiology"
  }'
```

**Get My Patients (Doctor):**
```bash
curl -X GET "http://localhost:5000/doctor/my-patients?token=YOUR_DOCTOR_TOKEN"
```

---

## License

Apache-2.0

---

## Author

Abhinav Kumar

---

## Repository

[https://github.com/abhinavkumar2369/Health-Track](https://github.com/abhinavkumar2369/Health-Track)
