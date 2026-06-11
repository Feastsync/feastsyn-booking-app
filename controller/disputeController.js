exports.createDispute = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const {reason,description,raisedBy} = req.body;

    const booking = await bookingModel.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }

    const dispute = await disputeModel.create({
      bookingId,
      userId: booking.userId,
      vendorId: booking.vendorId,
      reason,
      description,
      raisedBy
    });

    res.status(201).json({
      message: 'Dispute created Successfully',
      data: dispute
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};