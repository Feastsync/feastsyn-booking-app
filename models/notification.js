const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({

    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "recipientModel"
    },

    recipientModel: {
        type: String,
        required: true,
        enum: ["users", "vendors", "admins"]
    },

    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "senderModel"
    },

    senderModel: {
        type: String,
        enum: ["users", "vendors", "admins"]
    },

    recipientType: {
        type: String,
        enum: ["user", "vendor", "admin"],
        required: true
    },

    notificationType: {
        type: String,
        enum: [
            "booking_request",
            "booking_accepted",
            "booking_declined",
            "payment_received",
            "payment_released",
            "payment_completed",
            "review_received",
            "review_submitted",
            "service_confirmed"
        ]
    },

    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "bookings"
    },

    title: {
        type: String,
        required: true
    },

    message: {
        type: String,
        required: true
    },

    isRead: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

const notificationModel = mongoose.model("notification", notificationSchema);
module.exports = notificationModel;