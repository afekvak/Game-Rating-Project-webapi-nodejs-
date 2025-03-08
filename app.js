const express = require('express');
const connectDB = require('./config/db');
const session = require('express-session');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const app = express();
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(session({ secret: process.env.JWT_SECRET, resave: false, saveUninitialized: false }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/auth', require('./routes/authRoutes'));
app.use('/games', require('./routes/gameRoutes'));

app.use('/ratings', require('./routes/ratingRoutes'));
app.use('/recommendations', require('./routes/recommendationRoutes'));
app.use('/', require('./routes/viewRoutes'));
app.use((req, res, next) => {
    res.locals.user = req.session.user || null; // מעביר את המשתמש לכל הקבצים של EJS
    next();
});




module.exports = app;

