const notificationModel = require('../models/notification');
const userModel = require('../models/user');
const vendorModel = require('../models/vendor');
const bookingModel = require('../models/booking');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await notificationModel.find({recipientId: req.user.id}).populate({
        path: 'bookingId', select: `_id bookingStatus paymentStatus eventDate eventTime vendorId userId`}).sort({ createdAt: -1 });

    const formattedNotifications = notifications.map(notification => ({
      id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.notificationType,
      isRead: notification.isRead,
      createdAt: notification.createdAt,

      requestId: notification.bookingId?._id || null,
      booking: notification.bookingId
    }));

    return res.status(200).json({
      success: true,
      count: formattedNotifications.length,
      data: formattedNotifications
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {

    const { notificationId } = req.params;
    const notification = await notificationModel.findOneAndUpdate(
      {
        _id: notificationId,
        recipientId: req.user.id
      },
      {
        isRead: true
      },
      {
        new: true
      }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.markAllNotificationsAsRead = async (req, res) => {
  try {

    const result = await notificationModel.updateMany(
      {
        recipientId: req.user.id,
        isRead: false
      },
      {
        isRead: true
      }
    );

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      updatedCount: result.modifiedCount
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};