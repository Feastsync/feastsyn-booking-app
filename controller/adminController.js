const adminModel = require('../models/admin');


exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await userModel.countDocuments();

    const totalVendors = await vendorModel.countDocuments();

    const pendingKYC = await kycModel.countDocuments({
      verificationStatus: 'processing'
    });

    const verifiedVendors = await vendorModel.countDocuments({
      isKycVerified: true
    });

    const totalBookings = await bookingModel.countDocuments();

    const totalPayments = await paymentModel.countDocuments({
      status: 'success'
    });

    res.status(200).json({
      data: {
        totalUsers,
        totalVendors,
        pendingKYC,
        verifiedVendors,
        totalBookings,
        totalPayments
      }
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {

    const users = await userModel.find().select('-password');

    res.status(200).json({
      count: users.length,
      data: users
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.getOneUser = async (req, res) => {
  try {

    const { userId } = req.params;

    const user = await userModel.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.status(200).json({
      data: user
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.getAllVendorsAdmin = async (req, res) => {
  try {
    const vendors = await vendorModel.find().select('-password');
    res.status(200).json({
      count: vendors.length,
      data: vendors
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.getOneVendorAdmin = async (req, res) => {
  try {

    const { vendorId } = req.params;

    const vendor = await vendorModel.findById(vendorId).select('-password');
    if (!vendor) {
      return res.status(404).json({
        message: 'Vendor not found'
      });
    }
    res.status(200).json({
      data: vendor
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.suspendVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const vendor = await vendorModel.findByIdAndUpdate(
      vendorId,
      {
        isSuspended: true
      },
      {
        new: true
      }
    );

    if (!vendor) {
      return res.status(404).json({
        message: 'Vendor not found'
      });
    }
    res.status(200).json({
      message: 'Vendor suspended successfully',
      data: vendor
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.activateVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const vendor = await vendorModel.findByIdAndUpdate(
      vendorId,
      {
        isSuspended: false
      },
      {
        new: true
      }
    );

    if (!vendor) {
      return res.status(404).json({
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      message: 'Vendor activated successfully',
      data: vendor
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.getPendingKycs = async (req, res) => {
  try {
    const pendingKycs = await kycModel.find({verificationStatus: 'processing'}).populate(
        'vendorId',
        'firstName lastName stageName email'
      );

    res.status(200).json({
      count: pendingKycs.length,
      data: pendingKycs
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.approveKyc = async (req, res) => {
  try {
    const { kycId } = req.params;

    const kyc = await kycModel.findById(kycId);

    if (!kyc) {
      return res.status(404).json({
        message: 'KYC not found'
      });
    }
    kyc.verificationStatus = 'verified';

    await kyc.save();

    await vendorModel.findByIdAndUpdate(
      kyc.vendorId,
      {
        isKycVerified: true
      }
    );

    res.status(200).json({
      message: 'KYC approved successfully'
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.rejectKyc = async (req, res) => {
  try {
    const { kycId } = req.params;
    const { rejectionReason } = req.body;

    const kyc = await kycModel.findById(kycId);

    if (!kyc) {
      return res.status(404).json({
        message: 'KYC not found'
      });
    }
    kyc.verificationStatus = 'rejected';
    kyc.rejectionReason = rejectionReason;

    await kyc.save();

    res.status(200).json({
      message: 'KYC rejected successfully'
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await paymentModel.find().populate('userId','firstName lastName email').populate(
        'vendorId',
        'stageName firstName lastName'
      ).sort({createdAt: -1});

    res.status(200).json({
      message: 'All payments retrieved',  
      count: payments.length,
      data: payments
    }); 

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.getOnePayment = async (req, res) => {
  try {

    const { paymentId } = req.params;

    const payment = await paymentModel.findById(paymentId).populate('userId','firstName lastName email').populate('vendorId','stageName');
    if (!payment) {
      return res.status(404).json({
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      data: payment
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


exports.getAllBookings = async (req, res) => {
  try {

    const bookings = await bookingModel.find().populate('userId','firstName lastName email').populate(
        'vendorId',
        'stageName firstName lastName'
      );

    res.status(200).json({
      count: bookings.length,
      data: bookings
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.getOneBooking = async (req, res) => {
  try {

    const { bookingId } = req.params;

    const booking = await bookingModel.findById(bookingId).populate('userId','firstName lastName email').populate('vendorId','firstName lastName stageName' );
    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      message: 'One booking successfully retrieved',  
      data: booking
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.revenueSummary = async (req, res) => {
  try {

    const payments = await paymentModel.find({
      status: 'success'
    });

    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount,0);

    res.status(200).json({
      totalRevenue,
      totalTransactions: payments.length
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.resolveDispute = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { status, adminComment} = req.body;

    const dispute = await disputeModel.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({
        message: 'Dispute not found'
      });
    }

    dispute.status = status;
    dispute.adminComment = adminComment;

    await dispute.save();

    res.status(200).json({
      message: 'Dispute updated successfully',
      data: dispute
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.getVendorReviews = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const reviews = await reviewModel.find({ vendorId }).populate(
        'userId',
        'firstName lastName'
      );

    res.status(200).json({
      count: reviews.length,
      data: reviews
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

