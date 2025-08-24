# Health-Track Backend Project Structure

## 📁 Project Directory Structure

```
backend/
├── 📄 package.json                 # Project dependencies and scripts
├── 📄 server.js                   # Main application entry point
├── 📄 setup.js                    # Database setup script
├── 📄 .env                        # Environment variables
├── 📄 .env.example                # Environment template
├── 📄 README.md                   # Comprehensive documentation
├── 📄 .gitignore                  # Git ignore rules
│
├── 📁 models/                     # Database models (Mongoose schemas)
│   ├── 📄 User.js                 # User authentication and profile
│   ├── 📄 Doctor.js               # Doctor-specific information
│   ├── 📄 Patient.js              # Patient-specific information
│   ├── 📄 Appointment.js          # Appointment management
│   ├── 📄 MedicalRecord.js        # Medical records and prescriptions
│   └── 📄 Hospital.js             # Hospital information and statistics
│
├── 📁 routes/                     # API route handlers
│   ├── 📄 auth.js                 # Authentication endpoints
│   ├── 📄 admin.js                # Admin portal endpoints
│   ├── 📄 doctor.js               # Doctor portal endpoints
│   ├── 📄 patient.js              # Patient portal endpoints
│   └── 📄 fhir.js                 # HL7/FHIR integration endpoints
│
├── 📁 middleware/                 # Express middleware
│   ├── 📄 auth.js                 # Authentication and authorization
│   ├── 📄 errorHandler.js         # Global error handling
│   └── 📄 validation.js           # Input validation rules
│
├── 📁 services/                   # Business logic services
│   ├── 📄 notificationService.js  # Email notifications and cron jobs
│   └── 📄 nlpService.js           # OCR and NLP processing
│
├── 📁 utils/                      # Utility functions
│   └── 📄 helpers.js              # Common helper functions
│
└── 📁 controllers/                # Route controllers (can be expanded)
```

## 🎯 Feature Implementation Status

### ✅ Completed Features

#### 🏥 Admin Portal
- ✅ Dashboard with statistics and analytics
- ✅ Doctor management (create, read, update)
- ✅ Patient management (create, read, update)
- ✅ Hospital information management
- ✅ Visualization data (patient count, bed occupancy)
- ✅ Projected estimates calculation
- ✅ Department and specialization analytics

#### 👨‍⚕️ Doctor Portal
- ✅ Doctor dashboard with today's appointments
- ✅ Medical record creation with prescriptions
- ✅ Patient diagnosis and treatment management
- ✅ Lab report integration and tracking
- ✅ Patient complete medical history access
- ✅ Insurance report generation
- ✅ Appointment management and status updates

#### 👤 Patient Portal
- ✅ Personal profile management
- ✅ Medical record access (E-Records)
- ✅ Appointment booking and management
- ✅ Vaccination history tracking
- ✅ Emergency QR code generation
- ✅ Health tips with personalization
- ✅ Available doctors listing
- ✅ Appointment cancellation

#### 🔄 HL7/FHIR Integration
- ✅ FHIR Patient resource conversion
- ✅ FHIR Observation (medical records) conversion
- ✅ FHIR Practitioner (doctor) conversion
- ✅ Emergency data access via QR codes
- ✅ Bulk export for government data sharing
- ✅ External FHIR server synchronization

#### 🤖 AI & Automation Features
- ✅ AI-enabled appointment scheduling suggestions
- ✅ Automated appointment reminders
- ✅ Weekly health tips automation
- ✅ Optimal time slot calculations

#### 📄 OCR & NLP Features
- ✅ OCR for converting physical records (Tesseract.js)
- ✅ NLP for medical text processing
- ✅ Medical term extraction
- ✅ Structured data generation from free text
- ✅ Medical summary generation

## 🔧 Quick Start Guide

### 1. Prerequisites
```bash
# Install Node.js (v16 or higher)
# Install MongoDB (local or Docker)
# Install Git
```

### 2. Installation
```bash
# Clone and setup
cd "Health-Track/backend"
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Setup database with sample data
npm run setup

# Start development server
npm run dev
```

### 3. Test the API
```bash
# Health check
curl http://localhost:3000/api/health

# Login as admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@health-track.com","password":"admin123"}'
```

## 📊 Database Schema Overview

### Core Models Relationships
```
User (1) ←→ (1) Doctor
User (1) ←→ (1) Patient
Doctor (1) ←→ (M) Appointment ←→ (1) Patient
Patient (1) ←→ (M) MedicalRecord ←→ (1) Doctor
```

### Authentication Flow
```
1. User registers/logs in → JWT token issued
2. Token includes user ID and role
3. Middleware validates token and role
4. Role-based access to endpoints
```

## 🚀 Deployment Options

### 1. Docker Deployment
```bash
# Build image
docker build -t health-track-backend .

# Run with MongoDB
docker-compose up -d
```

### 2. Cloud Deployment (Example: Heroku)
```bash
# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongo-uri
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main
```

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting protection
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Input validation and sanitization
- ✅ Error handling without data exposure

## 📈 Monitoring & Analytics

### Built-in Analytics
- Patient registration trends
- Appointment statistics
- Department utilization
- Doctor performance metrics
- Hospital capacity tracking

### Health Monitoring
- API health check endpoint
- Database connection monitoring
- Error logging and tracking
- Performance metrics

## 🔮 Future Enhancements

### Potential Additions
- [ ] Video consultation integration
- [ ] Mobile app API endpoints
- [ ] Real-time notifications (WebSocket)
- [ ] Advanced AI diagnostics
- [ ] Blockchain for record integrity
- [ ] IoT device integration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Telemedicine features
- [ ] Payment gateway integration

## 🐛 Troubleshooting

### Common Issues
1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env

2. **JWT Token Invalid**
   - Check JWT_SECRET configuration
   - Verify token expiration

3. **Email Service Not Working**
   - Configure EMAIL_USER and EMAIL_PASS
   - Enable app passwords for Gmail

4. **File Upload Issues**
   - Configure Cloudinary credentials
   - Check file size limits

## 📞 Support & Contact

- **Issues**: Create GitHub issue
- **Documentation**: README.md
- **API Docs**: http://localhost:3000/api/health
- **Email**: support@health-track.com
