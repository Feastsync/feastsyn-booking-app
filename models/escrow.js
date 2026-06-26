const mongoose = require("mongoose");

const escrowSchema = new mongoose.Schema({

    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "bookings",
        required: true
    },

    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "vendors",
        required: true
    },

    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "payments",
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },

    commissionAmount: {
        type: Number,
        required: true
    },

    firstReleaseAmount: {
        type: Number,
        required: true
    },

    finalReleaseAmount: {
        type: Number,
        required: true
    },

    firstReleaseStatus: {
        type: String,
        enum: ["pending", "released"],
        default: "released"
    },

    finalReleaseStatus: {
        type: String,
        enum: ["pending", "released", "disputed"],
        default: "pending"
    },

    releaseReason: {
        type: String,
        enum: [
            "user_confirmation",
            "auto_release",
            "admin_release",
            null
        ],
        default: null
    },

    releaseAt: {
        type: Date,
        default: null
    },

    releaseAt: {
        type: Date,
        default: null
    },
    releaseReason: {
        type: String,
        enum: [ "user_confirmation", "auto_release", "admin_release" ]
    },

    releasedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admins",
        default: null
    }

}, { timestamps: true });

const escrowModel = mongoose.model('escrow',escrowSchema);
module.exports = escrowModel;