const express = require('express');
const { authentication } = require('../middlewares/auth');
const { createReview } = require('../controller/reviewController');
const { upload } = require('../middlewares/multer');
const router = require('express').Router();

router.post('/create-review/:bookingId', authentication, upload.fields([
    {
        name: 'images',
        maxCount: 4
    },
    {
        name: 'video',
        maxCount: 1
    }
]),createReview)
module.exports = router;