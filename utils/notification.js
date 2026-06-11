exports.createNotification = async ({
  recipientId,
  recipientType,
  title,
  message
}) => {

  await notificationModel.create({
    recipientId,
    recipientType,
    title,
    message
  });
};