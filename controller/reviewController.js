const userModel = require('../models/user');
const vendorModel = require('../models/vendor');
const reviewModel = require('../models/review');
const bookingModel = require('../models/booking');

exports.createReview = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { rating, comment } = req.body;

    const booking = await bookingModel.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }

    // Ensure logged-in user owns the booking
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Unauthorized'
      });
    }

    // Only completed bookings can be reviewed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        message: 'You can only review completed bookings'
      });
    }

    // Prevent duplicate reviews
    const existingReview = await reviewModel.findOne({
      bookingId
    });

    if (existingReview) {
      return res.status(400).json({
        message: 'Review already submitted'
      });
    }

    const uploadFile = async (
      file,
      resourceType = 'image'
    ) => {
      const uploaded = await cloudinary.uploader.upload(
        file.path,
        {
          resource_type: resourceType
        }
      );

      await fs.promises.unlink(file.path);

      return {
        secureUrl: uploaded.secure_url,
        publicId: uploaded.public_id
      };
    };

    let images = [];
    let video = null;

    // Upload Images (Maximum 4)
    if (req.files?.images?.length) {
      images = await Promise.all(
        req.files.images.map(file =>
          uploadFile(file, 'image')
        )
      );
    }

    // Upload Video (Maximum 1)
    if (req.files?.video?.length) {
      video = await uploadFile(
        req.files.video[0],
        'video'
      );
    }

    const review = await reviewModel.create({
      bookingId,
      vendorId: booking.vendorId,
      userId: req.user.id,
      rating,
      comment,
      images,
      video
    });

    return res.status(201).json({
      message: 'Review submitted successfully',
      data: review
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: error.message
    });
  }
};