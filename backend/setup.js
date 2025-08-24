const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Patient = require('./models/Patient');
const Hospital = require('./models/Hospital');
require('dotenv').config();

const setupDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/health-track');
    console.log('✅ Connected to MongoDB');

    // Create default admin user
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const admin = await User.create({
        email: 'admin@health-track.com',
        password: 'admin123',
        role: 'admin',
        profile: {
          firstName: 'System',
          lastName: 'Administrator',
          phone: '+1234567890'
        }
      });
      console.log('✅ Default admin user created:', admin.email);
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create default hospital
    const hospitalExists = await Hospital.findOne();
    if (!hospitalExists) {
      const hospital = await Hospital.create({
        name: 'Health Track General Hospital',
        address: {
          street: '123 Healthcare Ave',
          city: 'Medical City',
          state: 'Health State',
          zipCode: '12345',
          country: 'Healthcare Country'
        },
        contact: {
          phone: '+1-800-HEALTH',
          email: 'info@health-track.com',
          website: 'https://health-track.com'
        },
        capacity: {
          totalBeds: 200,
          occupiedBeds: 120,
          icuBeds: 20,
          emergencyBeds: 10
        },
        departments: [
          'Cardiology',
          'Neurology',
          'Orthopedics',
          'Pediatrics',
          'Emergency Medicine',
          'Internal Medicine',
          'Surgery',
          'Radiology',
          'Laboratory'
        ],
        facilities: [
          'Emergency Room',
          'ICU',
          'Operating Theaters',
          'Laboratory',
          'Radiology',
          'Pharmacy',
          'Blood Bank',
          'Cafeteria',
          'Parking'
        ]
      });
      console.log('✅ Default hospital created:', hospital.name);
    } else {
      console.log('ℹ️  Hospital already exists');
    }

    // Create sample doctor
    const doctorUserExists = await User.findOne({ email: 'doctor@health-track.com' });
    if (!doctorUserExists) {
      const doctorUser = await User.create({
        email: 'doctor@health-track.com',
        password: 'doctor123',
        role: 'doctor',
        profile: {
          firstName: 'John',
          lastName: 'Smith',
          phone: '+1234567891',
          dateOfBirth: '1980-05-15',
          gender: 'male'
        }
      });

      const doctor = await Doctor.create({
        user: doctorUser._id,
        licenseNumber: 'MD123456789',
        specialization: ['Cardiology', 'Internal Medicine'],
        department: 'Cardiology',
        experience: 15,
        qualifications: [
          {
            degree: 'MBBS',
            institution: 'Medical College University',
            year: 2005
          },
          {
            degree: 'MD Cardiology',
            institution: 'Cardiology Institute',
            year: 2008
          }
        ],
        schedule: {
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          workingHours: {
            start: '09:00',
            end: '17:00'
          },
          consultationDuration: 30
        },
        consultationFee: 150
      });

      console.log('✅ Sample doctor created:', doctorUser.email);
    } else {
      console.log('ℹ️  Sample doctor already exists');
    }

    // Create sample patient
    const patientUserExists = await User.findOne({ email: 'patient@health-track.com' });
    if (!patientUserExists) {
      const patientUser = await User.create({
        email: 'patient@health-track.com',
        password: 'patient123',
        role: 'patient',
        profile: {
          firstName: 'Jane',
          lastName: 'Doe',
          phone: '+1234567892',
          dateOfBirth: '1990-03-20',
          gender: 'female',
          address: {
            street: '456 Patient St',
            city: 'Patient City',
            state: 'Patient State',
            zipCode: '54321',
            country: 'Patient Country'
          }
        }
      });

      const patient = await Patient.create({
        user: patientUser._id,
        emergencyContact: {
          name: 'John Doe',
          relationship: 'spouse',
          phone: '+1234567893',
          email: 'john.doe@example.com'
        },
        medicalHistory: {
          allergies: ['Penicillin'],
          chronicConditions: [],
          medications: []
        },
        insurance: {
          provider: 'Health Insurance Co',
          policyNumber: 'POL123456789',
          groupNumber: 'GRP001',
          expirationDate: new Date('2024-12-31')
        },
        vaccinationHistory: [
          {
            vaccine: 'COVID-19',
            date: new Date('2023-01-15'),
            nextDue: new Date('2024-01-15'),
            batchNumber: 'COV123',
            provider: 'Health Track Hospital'
          }
        ],
        healthTips: {
          preferences: ['diet', 'exercise', 'general']
        }
      });

      console.log('✅ Sample patient created:', patientUser.email);
    } else {
      console.log('ℹ️  Sample patient already exists');
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Default Credentials:');
    console.log('👨‍💼 Admin: admin@health-track.com / admin123');
    console.log('👨‍⚕️ Doctor: doctor@health-track.com / doctor123');
    console.log('👤 Patient: patient@health-track.com / patient123');
    console.log('\n🚀 You can now start the server with: npm run dev');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
