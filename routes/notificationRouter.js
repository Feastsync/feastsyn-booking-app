const express = require('express');
const { authentication } = require('../middlewares/auth');
const { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } = require('../controller/notificationController');
const router = require('express').Router();

router.get('/', authentication, getNotifications);
router.put('/read-notification/:notificationId', authentication, markNotificationAsRead);
router.put('/mark-all-read', authentication, markAllNotificationsAsRead);

module.exports = router