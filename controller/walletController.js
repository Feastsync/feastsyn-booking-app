const vendorModel = require('../models/vendor');
const walletModel = require('../models/wallet');
const transactionModel = require('../models/transaction');
const escrowModel = require('../models/escrow');
const bookingModel = require('../models/booking');
const paymentModel = require('../models/payment');
const releaseEscrow = require('../utils/releaseEscrow')

exports.getWalletSummary = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const wallet = await walletModel.findOne({ vendorId });

    if (!wallet) {
      return res.status(404).json({
        message: "Wallet not found"
      });
    }

    const completedBookings = await bookingModel.countDocuments({
      vendorId,
      bookingStatus: "completed"
    });

    const pendingBookings = await bookingModel.countDocuments({
      vendorId,
      bookingStatus: "confirmed"
    });

    const pendingEscrow = await escrowModel.aggregate([
      {
        $match: {
          vendorId: wallet.vendorId,
          finalReleaseStatus: "pending"
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$finalReleaseAmount"
          }
        }
      }
    ]);

    const completedBookingIds = await bookingModel
      .find({
        vendorId,
        bookingStatus: "completed"
      })
      .select("_id");

    const bookingIds = completedBookingIds.map(
      item => item._id
    );

    const successfulEarnings = await escrowModel.aggregate([
      {
        $match: {
          bookingId: {
            $in: bookingIds
          }
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $subtract: [
                "$totalAmount",
                "$commissionAmount"
              ]
            }
          }
        }
      }
    ]);

    return res.status(200).json({
      message: "Wallet summary fetched successfully",

      data: {
        availableBalance: wallet.availableBalance || 0,

        totalEarnedThisYear:
          wallet.totalEarned || 0,

        totalSuccessful:
          successfulEarnings[0]?.total || 0,

        pendingEscrow:
          pendingEscrow[0]?.total || 0,

        completedBookings,

        pendingBookings
      }
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: error.message
    });
  }
};

exports.getWalletTransactions = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const {
      page = 1,
      limit = 10,
      type = "all",
      search
    } = req.query;

    const query = {
      vendorId
    };

    if (type === "commission") {
      query.transactionType = "commission";
    }

    if (type === "escrow") {
      query.transactionType = "escrow";
    }

    if (type === "release") {
      query.transactionType = "release";
    }

    if (type === "pending") {
      query.status = "pending";
    }

    const transactions = await transactionModel
      .find(query)
      .populate({
        path: "bookingId",
        select: "eventType"
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

    const filteredTransactions = search
      ? transactions.filter(item =>
          item.bookingId?._id
            ?.toString()
            .includes(search)
        )
      : transactions;

    const totalRecords =
      await transactionModel.countDocuments(query);

    const commissionTotal =
      await transactionModel.aggregate([
        {
          $match: {
            vendorId,
            transactionType: "commission"
          }
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amount"
            }
          }
        }
      ]);

    const escrowTotal =
      await transactionModel.aggregate([
        {
          $match: {
            vendorId,
            transactionType: "escrow",
            status: "pending"
          }
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amount"
            }
          }
        }
      ]);

    const releaseTotal =
      await transactionModel.aggregate([
        {
          $match: {
            vendorId,
            transactionType: "release",
            status: "successful"
          }
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amount"
            }
          }
        }
      ]);

    return res.status(200).json({
      message: "Transactions fetched successfully",

      summary: {
        totalSuccessful:
          releaseTotal[0]?.total || 0,

        totalCommission:
          commissionTotal[0]?.total || 0,

        escrowHeld:
          escrowTotal[0]?.total || 0,

        totalRecords
      },

      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(
          totalRecords / Number(limit)
        ),
        totalRecords
      },

      data: filteredTransactions.map(item => ({
        id: item._id,
        bookingId: item.bookingId?._id || null,
        eventType: item.bookingId?.eventType || null,
        description: item.description,
        amount: item.amount,
        transactionType: item.transactionType,
        status: item.status,
        date: item.createdAt
          .toISOString()
          .split("T")[0]
      }))
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: error.message
    });
  }
};