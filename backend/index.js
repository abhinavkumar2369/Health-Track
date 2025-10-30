const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

const corsOptions = {
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

// -- Database Connection --
const connectDB = require('./mongoDB/connectDB');
const mongoDB_status = connectDB();

// -- Routes --
app.get('/', (req, res) => {
    res.json({
        message: "Welcome to the API",
        server_status: "Success",
        database_status: mongoDB_status ? "Connected" : "Not Connected",
    })
})

const router = require("./router/authRouter");
app.use('/auth', router);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});