const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const recommendationRoutes = require('./routes/recommendationRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const profileRoutes = require('./routes/profileRoutes'); // ✅ Add this
const User = require('./models/User');
dotenv.config();

const app = express();
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(cookieParser()); // ✅ Moved this up so cookies work

app.set('view engine', 'ejs');
app.use(express.static('public'));

// ✅ Middleware to extract user from JWT cookie
app.use((req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        console.log("❌ No token found in request.");
        res.locals.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ Decoded JWT:", decoded);

        // ✅ Ensure `req.user` is properly set
        req.user = { userId: decoded.userId };
        res.locals.user = req.user; // ✅ Available in EJS templates
        console.log("✅ Middleware assigned user:", req.user);
    } catch (err) {
        console.error("❌ Invalid Token:", err.message);
        res.locals.user = null;
    }
    next();
});




// ✅ Define Routes
app.use('/profile', profileRoutes); // ✅ Add this
app.use('/auth', require('./routes/authRoutes'));
app.use('/games', require('./routes/gameRoutes'));
app.use('/ratings', require('./routes/ratingRoutes'));
app.use('/recommendations', require('./routes/recommendationRoutes'));
app.use('/', require('./routes/viewRoutes'));

module.exports = app;
