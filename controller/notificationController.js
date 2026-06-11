const notificationModel = require('../models/notification');
const userModel = require('../models/user');
const vendorModel = require('../models/vendor');
const adminModel = require('../models/admin');

exports.getNotifications = async (req, res) => {
  try {

    const notifications = await notificationModel.find({recipientId: req.user.id});
    res.status(200).json({
      count: notifications.length,
      data: notifications
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};