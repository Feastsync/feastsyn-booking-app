const { uploadKyc } = require('../controller/kycController')
const { authentication } = require('../middlewares/auth')
const {upload} = require('../middlewares/multer')
const router = require('express').Router()

router.post('/upload-kyc', authentication, upload.single('documentImage'), uploadKyc);
module.exports = router;