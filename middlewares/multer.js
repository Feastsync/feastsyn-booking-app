const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(process.cwd(), 'assets');

// Create assets folder if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() + '-' + Math.round(Math.random() * 1e9);

    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',

    // Videos
    'video/mp4',
    'video/mpeg',
    'video/webm',
  ];

  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.mp4', '.mpeg', '.webm', '.mov', '.avi' ];

  const ext = path.extname(file.originalname).toLowerCase();

  console.log('File Name:', file.originalname);
  console.log('Mime Type:', file.mimetype);

  if (
    allowedMimeTypes.includes(file.mimetype) &&
    allowedExtensions.includes(ext)
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'), false);
  }
};

exports.upload = multer({storage,limits: {fileSize: 50 * 1024 * 1024 // 50MB
},
  fileFilter
});