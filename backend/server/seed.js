require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

// Sample users for testing
const users = [
    {
        email: 'admin@healthtrack.com',
        password: 'Admin@12345',
        role: 'admin',
        firstName: 'System',
        lastName: 'Administrator',
        phone: '+1234567890',
        isFirstLogin: false
    },
    {
        email: 'doctor@healthtrack.com',
        password: 'Doctor@12345',
        role: 'doctor',
        firstName: 'Dr. John',
        lastName: 'Smith',
        phone: '+1234567891',
        isFirstLogin: false
    },
    {
        email: 'patient@healthtrack.com',
        password: 'Patient@12345',
        role: 'patient',
        firstName: 'Jane',
        lastName: 'Doe',
        phone: '+1234567892',
        isFirstLogin: false
    },
    {
        email: 'pharmacist@healthtrack.com',
        password: 'Pharmacist@12345',
        role: 'pharmacist',
        firstName: 'Sarah',
        lastName: 'Williams',
        phone: '+1234567893',
        isFirstLogin: false
    }
];

const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing users
        await User.deleteMany({});
        console.log('✅ Cleared existing users');

        // Create users with unique IDs
        for (const userData of users) {
            const uniqueId = await User.generateUniqueId(userData.role);
            await User.create({
                ...userData,
                uniqueId
            });
            console.log(`✅ Created ${userData.role}: ${userData.email} (ID: ${uniqueId})`);
        }

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📝 Test Credentials:');
        console.log('-------------------');
        users.forEach(user => {
            console.log(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
        });
        console.log('-------------------\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
