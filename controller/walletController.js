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
        message: 'Wallet not found'
      });
    }

    const currentYear = new Date().getFullYear();

    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    // Total earned this year
    const yearlyTransactions = await transactionModel.aggregate([
      {
        $match: {
          vendorId: wallet.vendorId,
          transactionType: 'release',
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
            $sum: '$amount'
          }
        }
      }
    ]);

    // Pending escrow
    const escrowSummary = await escrowModel.aggregate([
      {
        $match: {
          vendorId: wallet.vendorId
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $add: [
                {
                  $cond: [
                    { $eq: ['$firstReleaseStatus', 'pending'] },
                    '$firstReleaseAmount',
                    0
                  ]
                },
                {
                  $cond: [
                    { $eq: ['$finalReleaseStatus', 'pending'] },
                    '$finalReleaseAmount',
                    0
                  ]
                }
              ]
            }
          }
        }
      }
    ]);

    // Completed bookings
    const completedBookings = await bookingModel.countDocuments({
      vendorId,
      bookingStatus: 'completed'
    });

    // Pending bookings
    const pendingBookings = await bookingModel.countDocuments({
      vendorId,
      bookingStatus: 'confirmed'
    });

    return res.status(200).json({
      message: 'Wallet summary fetched successfully',

      data: {availableBalance: wallet.availableBalance,

        totalEarnedThisYear: yearlyTransactions[0]?.total || 0,

        pendingEscrow: escrowSummary[0]?.total || 0,

        completedBookings, pendingBookings
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
    const {page = 1, limit = 10, type, search } = req.query;

    const query = {vendorId};
    if (type && type !== 'all') {
      query.transactionType = type;
    }
    const transactions = await transactionModel.find(query).populate({
        path: 'bookingId',
        select: 'eventType'
      }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));

    let filteredTransactions = transactions;

    if (search) {
      filteredTransactions = transactions.filter(
        (item) => item.bookingId?._id?.toString().includes(search));
    }

    const total = await transactionModel.countDocuments(query);

    return res.status(200).json({
      message: 'Transactions fetched successfully',

      pagination: {currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total},

      data: filteredTransactions.map((item) => ({
        id: item._id,

        bookingId: item.bookingId?._id || null,

        description:item.description ,

        date: item.createdAt.toISOString().split('T')[0],
        amount: item.amount,

        transactionType: item.transactionType,
        status: item.status}))
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: error.message
    });
  }
};