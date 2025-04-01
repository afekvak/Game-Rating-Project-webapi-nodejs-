// middleware/upload.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // unique file name
    }
});

const upload = multer({ storage });

module.exports = upload;
