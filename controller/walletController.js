const vendorModel = require('../models/vendor');
const walletModel = require('../models/wallet');
const transactionModel = require('../models/transaction');
const escrowModel = require('../models/escrow');
const bookingModel = require('../models/booking');

exports.getWalletSummary = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const wallet = await walletModel.findOne({ vendorId });

    if (!wallet) {
      return res.status(404).json({
        message: "Wallet not found"
      });
    }

    const currentYear = new Date().getFullYear();

    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    // TOTAL EARNED THIS YEAR
    // (Total vendor share after commission)
    const yearlyEarnings = await escrowModel.aggregate([
      {
        $match: {
          vendorId: wallet.vendorId,
          createdAt: {
            $gte: startOfYear,
            $lte: endOfYear
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

    // PENDING ESCROW (30% not released)
    const escrowSummary = await escrowModel.aggregate([
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

    // COMPLETED BOOKINGS
    const completedBookings = await bookingModel.countDocuments({
      vendorId,
      bookingStatus: "completed"
    });

    // PENDING BOOKINGS
    const pendingBookings = await bookingModel.countDocuments({
      vendorId,
      bookingStatus: "confirmed"
    });

    // TOTAL SUCCESSFUL
    // Earnings from completed events only
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
        availableBalance: wallet.availableBalance,

        totalEarnedThisYear:
          yearlyEarnings[0]?.total || 0,

        totalSuccessful:
          successfulEarnings[0]?.total || 0,

        pendingEscrow:
          escrowSummary[0]?.total || 0,

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
      type,
      search
    } = req.query;

    const query = {
      vendorId
    };

    if (
      type &&
      type !== "all" &&
      type !== "pending"
    ) {
      query.transactionType = type;
    }

    if (type === "pending") {
      query.status = "pending";
    }

    let transactions = await transactionModel
      .find(query)
      .populate({
        path: "bookingId",
        select: "eventType"
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

    if (search) {
      transactions = transactions.filter(item =>
        item.bookingId?._id
          ?.toString()
          .includes(search)
      );
    }

    const total = await transactionModel.countDocuments(query);

    // Dashboard totals

    const totalSuccessful = await transactionModel.aggregate([
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

    const totalCommission = await transactionModel.aggregate([
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

    const escrowHeld = await transactionModel.aggregate([
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

    return res.status(200).json({
      message: "Transactions fetched successfully",

      summary: {
        totalSuccessful:
          totalSuccessful[0]?.total || 0,

        totalCommission:
          totalCommission[0]?.total || 0,

        escrowHeld:
          escrowHeld[0]?.total || 0,

        totalRecords: total
      },

      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total
      },

      data: transactions.map(item => ({
        id: item._id,

        bookingId:
          item.bookingId?._id || null,

        eventType:
          item.bookingId?.eventType || null,

        description: item.description,

        amount: item.amount,

        transactionType:
          item.transactionType,

        status: item.status,

        date:
          item.createdAt
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