# Health-Track Backend Server

A robust JWT-based authentication and authorization system for the Health-Track healthcare management platform.

## Features

- ✅ JWT Authentication
- ✅ Role-Based Access Control (Admin, Doctor, Patient, Pharmacist)
- ✅ Secure Password Hashing with bcrypt
- ✅ MongoDB Database Integration
- ✅ Auto-generated Unique IDs for each role
- ✅ Random Password Generation for new users
- ✅ First-login password change enforcement
- ✅ User activation/deactivation
- ✅ Protected API routes
- ✅ RESTful API design

## Project Structure

```
backend/server/
├── config/
│   └── db.js                 # Database connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── adminController.js    # Admin operations
│   └── doctorController.js   # Doctor operations
├── middleware/
│   └── auth.js              # JWT verification & authorization
├── models/
│   └── User.js              # User schema
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── adminRoutes.js       # Admin endpoints
│   └── doctorRoutes.js      # Doctor endpoints
├── utils/
│   ├── generateToken.js     # JWT token generation
│   └── generatePassword.js  # Random password generator
├── .env                     # Environment variables
├── .gitignore
├── index.js                 # Main server file
├── package.json
└── API_DOCUMENTATION.md     # Complete API docs
```

## Installation

1. **Clone the repository**
```bash
cd backend/server
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup MongoDB**
   - Install MongoDB locally OR
   - Create a MongoDB Atlas account and get connection string

4. **Configure environment variables**
   - Update `.env` file with your settings:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/health-track
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

5. **Start the server**
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/health-track` |
| `JWT_SECRET` | Secret key for JWT | `your_secret_key` |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `NODE_ENV` | Environment mode | `development` / `production` |

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatepassword` - Update password
- `POST /api/auth/logout` - Logout user

### Admin (`/api/admin`)
- `POST /api/admin/register` - Register admin (public for first admin)
- `GET /api/admin/users` - Get all users (with filters)
- `GET /api/admin/users/:id` - Get single user
- `PUT /api/admin/users/:id/activate` - Activate user
- `PUT /api/admin/users/:id/deactivate` - Deactivate user

### Doctor (`/api/doctor`)
- `POST /api/doctor/patients` - Add new patient
- `POST /api/doctor/doctors` - Add new doctor
- `POST /api/doctor/pharmacists` - Add new pharmacist
- `GET /api/doctor/patients` - Get all patients
- `GET /api/doctor/doctors` - Get all doctors
- `GET /api/doctor/pharmacists` - Get all pharmacists

## Usage Flow

### 1. Register First Admin
```http
POST http://localhost:3001/api/admin/register
Content-Type: application/json

{
  "email": "admin@healthtrack.com",
  "password": "Admin@123",
  "firstName": "System",
  "lastName": "Admin",
  "phone": "+1234567890"
}
```

### 2. Login
```http
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "admin@healthtrack.com",
  "password": "Admin@123"
}
```

Response will include a JWT token.

### 3. Use Token for Protected Routes
```http
GET http://localhost:3001/api/admin/users
Authorization: Bearer <your_jwt_token>
```

### 4. Doctor Adds Patient
```http
POST http://localhost:3001/api/doctor/patients
Authorization: Bearer <doctor_jwt_token>
Content-Type: application/json

{
  "email": "patient@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

Response includes auto-generated password that must be shared with the patient.

## User Roles & Permissions

| Role | Can Sign Up | Can Sign In | Can Add Users | Can Manage All Users |
|------|-------------|-------------|---------------|---------------------|
| Admin | ✅ (First only) | ✅ | ❌ | ✅ |
| Doctor | ❌ | ✅ | ✅ (Patients, Doctors, Pharmacists) | ❌ |
| Patient | ❌ | ✅ | ❌ | ❌ |
| Pharmacist | ❌ | ✅ | ❌ | ❌ |

## Unique ID Format

Each user type gets a unique ID with a specific prefix:
- **Admin**: `ADM00001`, `ADM00002`, ...
- **Doctor**: `DOC00001`, `DOC00002`, ...
- **Patient**: `PAT00001`, `PAT00002`, ...
- **Pharmacist**: `PHR00001`, `PHR00002`, ...

## Security Features

- **Password Hashing**: All passwords are hashed using bcryptjs
- **JWT Tokens**: Secure token-based authentication
- **Role-Based Access**: Middleware enforces role permissions
- **First Login Check**: New users must change their auto-generated password
- **User Activation**: Admins can activate/deactivate users
- **Protected Routes**: All sensitive routes require valid JWT

## Dependencies

- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT implementation
- `bcryptjs` - Password hashing
- `dotenv` - Environment variable management
- `cors` - Cross-Origin Resource Sharing
- `nodemon` - Development auto-reload

## Testing

Use tools like:
- **Postman**
- **Thunder Client** (VS Code extension)
- **Insomnia**
- **cURL**

See `API_DOCUMENTATION.md` for detailed endpoint examples.

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description here"
}
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

ISC

## Author

Abhinav Kumar

## Support

For issues and questions, please create an issue in the GitHub repository.
