const walletModel = require("../models/wallet");
const transactionModel = require("../models/transaction");
const escrowModel = require("../models/escrow");


const releaseEscrow = async (
    bookingId,
    releaseReason,
    releasedBy = null
) => {

    const escrow = await escrowModel.findOne({
        bookingId,
        finalReleaseStatus: "pending"
    });

    if (!escrow) {
        throw new Error("No pending escrow found.");
    }

    const wallet = await walletModel.findOne({
        vendorId: escrow.vendorId
    });

    if (!wallet) {
        throw new Error("Vendor wallet not found.");
    }

    // Move money from escrow to available balance

    wallet.escrowBalance -= escrow.finalReleaseAmount;

    wallet.availableBalance += escrow.finalReleaseAmount;

    await wallet.save();

    // Update escrow

    escrow.finalReleaseStatus = "released";

    escrow.releaseReason = releaseReason;

    escrow.releasedAt = new Date();

    escrow.releasedBy = releasedBy;

    await escrow.save();

    // Create transaction

    await transactionModel.create({

        vendorId: escrow.vendorId,

        walletId: wallet._id,

        bookingId,

        amount: escrow.finalReleaseAmount,

        transactionType: "release",

        description: `30% escrow released (${releaseReason})`,

        status: "successful"

    });

    return escrow;

};

module.exports = releaseEscrow;