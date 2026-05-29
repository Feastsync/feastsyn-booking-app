const multer = require('multer');

exports.upload = multer({

  storage: multer.diskStorage({

    destination: (req, file, cb) => {
      cb(null, './assets');
    },

    filename: function (req, file, cb) {

      const uniqueSuffix =
        Date.now() + '-' + Math.round(Math.random() * 1E9);

      cb(null, file.fieldname + '-' + uniqueSuffix);
    }

  }),

  limits: {
    fileSize: 1024 * 1024 * 50
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