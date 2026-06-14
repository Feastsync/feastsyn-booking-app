const express = require('express');
const { authentication } = require('../middlewares/auth');
const { sendMessage, getMessages , getMessagesByRoom } = require('../controller/messageController');

const router = express.Router();

 router.get("/history/:roomId", getMessagesByRoom);

router.post('/messages/:bookingId', sendMessage);

router.get('/:bookingId', authentication, getMessages);

module.exports = router; 