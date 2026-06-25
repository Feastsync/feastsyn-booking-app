const mongoose = require("mongoose");
const payoutSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "vendors"
        },
    amount: {
        type: Number
        },
    reference: {
        type: String,
        unique: true
        },
    bankName: {
        type: String
        },
        bankCode: {
            type: String
        },

    accountNumber: {
        type: String
        },
    status: {
        type: String,
        enum: [ "processing", "successful", "failed"],
        default: "processing"
        }
    },
    {
        timestamps: true
    }
);

const payoutModel = mongoose.model("payout", payoutSchema);
module.exports = payoutModel