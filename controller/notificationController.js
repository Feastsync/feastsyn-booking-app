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