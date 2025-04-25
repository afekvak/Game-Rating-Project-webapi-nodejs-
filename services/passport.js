const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { sendWelcomeEmail } = require('./emailService'); // ⬅️ עדכן אם הנתיב שונה

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;

        let user = await User.findOne({ email });

        if (user) {
            // משתמש כבר קיים → מחזירים אותו
            return done(null, user);
        }

        // משתמש חדש
        user = new User({
            fullName: profile.displayName,
            email: email,
            username: email.split('@')[0], // ← מחלץ את החלק שלפני ה־@ כדי לשים כ־username
            googleId: profile.id,
            emailVerified: true
          });
          

        await user.save();

        // שולחים Welcome Email רק למשתמשים חדשים
        sendWelcomeEmail(user.email, user.fullName);

        return done(null, user);
    } catch (err) {
        console.error('❌ Google Auth Error:', err);
        return done(err, null);
    }
}));

