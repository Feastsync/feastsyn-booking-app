const { uploadKyc, approveKyc, rejectKyc, getPendingKycs } = require('../controller/kycController')
const { authentication } = require('../middlewares/auth')
const {upload} = require('../middlewares/multer')
const router = require('express').Router()

router.post('/upload-kyc', authentication, upload.single('documentImage'), uploadKyc);
router.post('/approve-kyc/:kycId', authentication, approveKyc);
router.post('/reject-kyc/:kycId', authentication, rejectKyc);
router.get('/get-pending-kyc', authentication, getPendingKycs)
module.exports = router;