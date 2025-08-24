# Health Track Backend API

A comprehensive hospital management system with Admin, Doctor, and Patient portals, featuring HL7/FHIR integration for government data sharing.

## 🚀 Features

### 🎯 Admin Portal
- Add and manage doctors and patients
- Dashboard with visualization data
- Hospital statistics and analytics
- Projected estimates for resource planning
- User management and access control

### 🎯 Doctor Portal
- Patient record management
- Medical record creation with prescriptions and diagnosis
- Lab report integration and management
- AI-enabled appointment scheduling
- Complete patient record generation for insurance
- Patient medical history access

### 🎯 Patient Portal
- Personal profile management
- Medical record access (E-Records)
- OCR and NLP for converting physical records
- Vaccination history tracking
- Personalized health tips (diet, exercise, yoga)
- Emergency QR code for medical record access
- Appointment booking and management

### 🎯 HL7/FHIR Integration
- FHIR-compliant data export
- Government data sharing capabilities
- Emergency medical data access via QR codes
- Bulk export for policy development

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcrypt
- **File Processing**: Multer, Cloudinary
- **OCR**: Tesseract.js
- **NLP**: Natural (Node.js NLP library)
- **QR Codes**: qrcode library
- **Email**: Nodemailer
- **Scheduling**: node-cron
- **Security**: Helmet, CORS, Rate Limiting

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd health-track/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/health-track
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-cloudinary-key
   CLOUDINARY_API_SECRET=your-cloudinary-secret
   FHIR_SERVER_URL=http://localhost:8080/fhir
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # Or start local MongoDB service
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "patient|doctor|admin",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "dateOfBirth": "1990-01-01",
    "gender": "male",
    "address": {
      "street": "123 Main St",
      "city": "City",
      "state": "State",
      "zipCode": "12345",
      "country": "Country"
    }
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Admin Endpoints

#### Get Dashboard Statistics
```http
GET /api/admin/dashboard
Authorization: Bearer <token>
```

#### Create Doctor
```http
POST /api/admin/doctors
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "doctor@example.com",
  "password": "password123",
  "profile": {
    "firstName": "Dr. Jane",
    "lastName": "Smith",
    "phone": "+1234567890"
  },
  "licenseNumber": "MD123456",
  "specialization": ["Cardiology", "Internal Medicine"],
  "department": "Cardiology",
  "experience": 10,
  "consultationFee": 150,
  "qualifications": [
    {
      "degree": "MBBS",
      "institution": "Medical College",
      "year": 2010
    }
  ],
  "schedule": {
    "workingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "workingHours": {
      "start": "09:00",
      "end": "17:00"
    },
    "consultationDuration": 30
  }
}
```

#### Get All Doctors
```http
GET /api/admin/doctors?page=1&limit=10&department=Cardiology
Authorization: Bearer <token>
```

#### Create Patient
```http
POST /api/admin/patients
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "patient@example.com",
  "password": "password123",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "dateOfBirth": "1990-01-01",
    "gender": "male"
  },
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "spouse",
    "phone": "+1234567891",
    "email": "jane@example.com"
  },
  "medicalHistory": {
    "allergies": ["Penicillin", "Peanuts"],
    "chronicConditions": ["Diabetes Type 2"],
    "medications": [
      {
        "name": "Metformin",
        "dosage": "500mg",
        "frequency": "twice daily",
        "startDate": "2023-01-01"
      }
    ]
  },
  "insurance": {
    "provider": "Health Insurance Co",
    "policyNumber": "POL123456",
    "groupNumber": "GRP789",
    "expirationDate": "2024-12-31"
  }
}
```

### Doctor Endpoints

#### Get Doctor Dashboard
```http
GET /api/doctor/dashboard
Authorization: Bearer <token>
```

#### Create Medical Record
```http
POST /api/doctor/medical-records
Authorization: Bearer <token>
Content-Type: application/json

{
  "patient": "patient_id",
  "appointment": "appointment_id",
  "chiefComplaint": "Chest pain",
  "symptoms": ["chest pain", "shortness of breath"],
  "diagnosis": {
    "primary": "Angina",
    "secondary": ["Hypertension"],
    "icdCodes": ["I20.9"]
  },
  "prescription": [
    {
      "medication": "Aspirin",
      "dosage": "75mg",
      "frequency": "once daily",
      "duration": "30 days",
      "instructions": "Take with food"
    }
  ],
  "labTests": [
    {
      "testName": "ECG",
      "ordered": true,
      "orderedDate": "2023-12-01"
    }
  ],
  "vitals": {
    "bloodPressure": "140/90",
    "heartRate": 85,
    "temperature": 98.6,
    "weight": 75,
    "height": 175,
    "oxygenSaturation": 98
  },
  "notes": "Patient reports chest pain for 2 days",
  "followUpDate": "2023-12-15"
}
```

#### Get Patient History
```http
GET /api/doctor/patients/:patientId/history
Authorization: Bearer <token>
```

#### Generate Insurance Report
```http
GET /api/doctor/patients/:patientId/insurance-report
Authorization: Bearer <token>
```

### Patient Endpoints

#### Get Patient Dashboard
```http
GET /api/patient/dashboard
Authorization: Bearer <token>
```

#### Book Appointment
```http
POST /api/patient/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "doctor": "doctor_id",
  "appointmentDate": "2023-12-15",
  "appointmentTime": "10:00",
  "type": "consultation",
  "notes": {
    "patient": "Follow-up for chest pain"
  }
}
```

#### Get Medical Records
```http
GET /api/patient/medical-records?page=1&limit=10
Authorization: Bearer <token>
```

#### Get Emergency QR Code
```http
GET /api/patient/emergency-qr
Authorization: Bearer <token>
```

#### Get Health Tips
```http
GET /api/patient/health-tips
Authorization: Bearer <token>
```

#### Update Health Tips Preferences
```http
PUT /api/patient/health-tips/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "preferences": ["diet", "exercise", "yoga"]
}
```

### FHIR Endpoints

#### Get Patient in FHIR Format
```http
GET /api/fhir/patient/:patientId
Authorization: Bearer <token>
```

#### Get Medical Record as FHIR Observation
```http
GET /api/fhir/observation/:recordId
Authorization: Bearer <token>
```

#### Emergency Data Access (Public)
```http
GET /api/fhir/emergency/:patientId
```

#### Bulk Export for Government
```http
GET /api/fhir/export/bulk?startDate=2023-01-01&endDate=2023-12-31&resourceType=Patient
Authorization: Bearer <token>
```

## 🔒 Security Features

- JWT-based authentication with role-based access control
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- CORS configuration for cross-origin requests
- Helmet for security headers
- Input validation and sanitization
- Error handling without sensitive information exposure

## 📊 Database Schema

### User Model
- Basic user information (email, password, role, profile)
- Role-based access (admin, doctor, patient)
- Profile information with address and contact details

### Doctor Model
- License information and specializations
- Department and experience details
- Schedule and consultation fee
- Qualifications and ratings

### Patient Model
- Unique patient ID generation
- Emergency contact information
- Medical history and current medications
- Insurance details and vaccination history
- QR code for emergency access

### Medical Record Model
- Visit details and chief complaint
- Symptoms, diagnosis, and prescription
- Lab tests with results and status
- Vital signs and attachments
- FHIR data storage for interoperability

### Appointment Model
- Doctor and patient references
- Date, time, and appointment type
- Status tracking and notes
- AI suggestions for optimal scheduling

## 🔄 Automated Services

### Email Notifications
- Appointment reminders sent 24 hours before
- Weekly health tips based on patient preferences
- Automated scheduling using node-cron

### AI Features
- Optimal appointment time suggestions
- Health tips personalization
- Medical record analysis trends

### NLP and OCR
- Convert physical documents to digital records
- Extract medical terms from free text
- Generate structured data from unstructured input

## 🚀 Deployment

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://mongo:27017/health-track
JWT_SECRET=your-production-secret
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "errors": [
    // Validation errors array (if applicable)
  ]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Email: support@health-track.com
- Documentation: [API Docs](http://localhost:3000/api/health)

## 🔄 Changelog

### Version 1.0.0
- Initial release with all core features
- Admin, Doctor, and Patient portals
- HL7/FHIR integration
- OCR and NLP capabilities
- Emergency QR code system
- Automated notifications and scheduling
