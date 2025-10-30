const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const User = require('../mongoDB/User');

// Sign-up controller
async function signUp(req, res) {
    const { email, password, fullname } = req.body;
    if (!email || !password || !fullname) {
        return res.status(400).json({ error: 'Missing fields.' });
    }
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'Email exists.' });
        }
        const profession = 'admin';
        const newUser = new User({ email, password, fullname, profession });
    await newUser.save();
    const token = jwt.sign({ email, fullname, profession }, JWT_SECRET);
    return res.json({ status: "success", id: newUser._id, profession, jwt: token });
    } catch (err) {
        return res.status(500).json({ error: 'Server error.' });
    }
}

module.exports = signUp;
