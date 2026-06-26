const escrowModel = require("../models/escrow");
const walletModel = require("../models/wallet");
const bookingModel = require("../models/booking");
const transactionModel = require("../models/transaction");
const releaseEscrow = require('../utils/releaseEscrow');

exports.releaseExpiredEscrows = async () => {
    try {
        const escrows = await escrowModel.find({
            finalReleaseStatus: "pending",
            releaseAt: {
                $lte: new Date()
            }

        });

        for (const escrow of escrows) {

            const booking = await bookingModel.findById(
                escrow.bookingId
            );

            if (!booking) continue;

            const wallet = await walletModel.findOne({

                vendorId: escrow.vendorId

            });

            if (!wallet) continue;

            wallet.availableBalance += escrow.finalReleaseAmount;

            wallet.escrowBalance -= escrow.finalReleaseAmount;

            await wallet.save();

            booking.bookingStatus = "completed";

            booking.completedAt = new Date();

            await booking.save();

            escrow.finalReleaseStatus = "released";

            escrow.releaseReason = "auto_release";

            escrow.releasedAt = new Date();

            await escrow.save();

            await transactionModel.create({

                vendorId: escrow.vendorId,

                walletId: wallet._id,

                bookingId: booking._id,

                amount: escrow.finalReleaseAmount,

                transactionType: "release",

                description: "Automatic escrow release after 24 hours",

                status: "successful"
            });
            console.log(`Escrow released for booking ${booking._id}`);
        }
    } catch (error) {
        console.log(error);

    }

};