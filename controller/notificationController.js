const notificationModel = require("../models/notification");
const userModel = require("../models/user");
const vendorModel = require("../models/vendor");

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await notificationModel
      .find({ recipientId: req.user.id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await notificationModel.findOneAndUpdate({
        _id: notificationId,
        recipientId: req.user.id
      }, { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }

    return res.status(200).json({
      message: "Notification marked as read",
      data: notification
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    await notificationModel.updateMany(
      { recipientId: req.user.id, isRead: false },
      { isRead: true }
    );

    return res.status(200).json({
      message: "All notifications marked as read"
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};