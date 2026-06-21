const notificationModel = require("../models/notification");
const userModel = require("../models/user");
const vendorModel = require("../models/vendor");
const {brevo} = require("../utils/brevo");

exports.createNotification = async ({recipientId,recipientType,title,message, emailSubject}) => {
  let recipient;
  if (recipientType === "user") {
    recipient = await userModel.findById(recipientId);
  }

  if (recipientType === "vendor") {
    recipient = await vendorModel.findById(recipientId);
  }

  if (!recipient) {
    throw new Error(`${recipientType} not found`);
  }

  const notification = await notificationModel.create({
    recipientId,
    recipientType,
    title,
    message,
    isRead: false
  });

  try {
    const response = await brevo(
    recipient.email,
    recipient.firstName || recipient.businessName,
    message,
    emailSubject || title
  );

  console.log("Brevo response:", response);
  } catch (error) {
     console.error("Brevo failed:", error.response?.body || error);
  }

  return notification;
};