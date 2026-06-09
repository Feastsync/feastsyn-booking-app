const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure assets folder exists
if (!fs.existsSync('./assets')) {
  fs.mkdirSync('./assets', { recursive: true });
}

exports.upload = multer({
  storage: multer.diskStorage({

    destination: (req, file, cb) => {
      cb(null, './assets');
    },

    filename: (req, file, cb) => {
      const uniqueSuffix =
        Date.now() + '-' + Math.round(Math.random() * 1e9);

      cb(
        null,
        `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
      );
    }

  }),

  limits: {
    fileSize: 1024 * 1024 * 50 // 50MB
  },

  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('video/')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'));
    }
  }
});