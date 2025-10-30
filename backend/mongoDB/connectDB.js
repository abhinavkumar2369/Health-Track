const mongoose = require('mongoose');
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGODB_URL);
        console.log("------------------------------")
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log("------------------------------");
        return true;
    }
    catch (error) {
        console.log("------------------------------")
        console.error(`Error: ${error.message}`);
        console.log("------------------------------")
        return false;
    }
};

module.exports = connectDB;