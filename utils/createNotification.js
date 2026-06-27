const notificationModel = require("../models/notification");
const userModel = require("../models/user");
const vendorModel = require("../models/vendor");
const {brevo} = require("../utils/brevo");
const {paymentReleasedTemplate} = require('../email')

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
    recipient.firstName || recipient.stageName || "Vendor",
    paymentReleasedTemplate(
        recipient.firstName || recipient.stageName,
        escrow.finalReleaseAmount
    ),
    "Payment Released"
);
  } catch (error) {
     console.error("Brevo failed:");
     console.error(error.message);

  if (error.response) {
    console.error(error.response);
  }

  if (error.body) {
    console.error(error.body);
  }
  }

  return notification;
};