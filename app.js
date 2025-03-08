const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

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
        res.locals.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        res.locals.user = decoded; // ✅ Now available in all EJS templates
    } catch (err) {
        res.locals.user = null;
    }
    next();
});


// ✅ Define Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/games', require('./routes/gameRoutes'));
app.use('/ratings', require('./routes/ratingRoutes'));
app.use('/recommendations', require('./routes/recommendationRoutes'));
app.use('/', require('./routes/viewRoutes'));

module.exports = app;
