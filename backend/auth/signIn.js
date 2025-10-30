const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const User = require('../mongoDB/User');

// Sign-in controller
async function signIn(req, res) {
    const { email, password, profession } = req.body;
    if (!email || !password || !profession) {
        return res.status(400).json({ error: 'Missing fields.' });
    }
    try {
        const user = await User.findOne({ email, password, profession });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }
        const token = jwt.sign({ email: user.email, fullname: user.fullname, profession: user.profession }, JWT_SECRET);
        return res.json({ status: "success", id: user._id, profession: user.profession, jwt: token });
    } catch (err) {
        return res.status(500).json({ error: 'Server error.' });
    }
}

module.exports = signIn;
