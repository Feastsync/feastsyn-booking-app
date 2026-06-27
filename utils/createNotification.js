const notificationModel = require("../models/notification");
const userModel = require("../models/user");
const vendorModel = require("../models/vendor");
const { brevo } = require("../utils/brevo");

exports.createNotification = async ({
    recipientId,
    recipientType,
    title,
    message,
    emailSubject,
    emailBody,
    bookingId = null,
    senderId = null,
    notificationType = null
}) => {

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
        bookingId,
        senderId,
        notificationType,
        title,
        message,
        isRead: false
    });

    try {

        await brevo(
            recipient.email,
            recipient.firstName || recipient.stageName || "User",
            emailBody || message,
            emailSubject || title
        );

    } catch (error) {

        console.error("Brevo failed");
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