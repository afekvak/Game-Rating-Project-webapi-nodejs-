const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    const token = req.cookies.token; // ✅ Get JWT from cookies

    if (!token) {
        return res.redirect('/login'); // Redirect if not logged in
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        res.locals.user = decoded; // ✅ Now available in all templates
        next();
    } catch (error) {
        res.clearCookie("token");
        return res.redirect('/login');
    }
};
