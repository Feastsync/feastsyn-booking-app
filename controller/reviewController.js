const userModel = require('../models/user');
const vendorModel = require('../models/vendor');
const reviewModel = require('../models/review');
const bookingModel = require('../models/booking');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');

exports.createReview = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { rating, comment } = req.body;

    const booking = await bookingModel.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    // Ensure the logged-in user owns the booking
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized"
      });
    }

    // Allow review only after customer has confirmed service delivery
    if (!booking.isEventConfirmed) {
      return res.status(400).json({
        message: "You can only review a completed service."
      });
    }

    // Extra safety check
    if (booking.bookingStatus !== "completed") {
      return res.status(400).json({
        message: "You can only review completed bookings."
      });
    }

    // Validate rating
    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5."
      });
    }

    // Prevent duplicate reviews
    const existingReview = await reviewModel.findOne({
      bookingId
    });

    if (existingReview) {
      return res.status(400).json({
        message: "Review already submitted."
      });
    }

    const uploadFile = async (file, resourceType = "image") => {
      const uploaded = await cloudinary.uploader.upload(file.path, {
        resource_type: resourceType
      });

      await fs.promises.unlink(file.path);

      return {
        secureUrl: uploaded.secure_url,
        publicId: uploaded.public_id
      };
    };

    let images = [];
    let video = null;

    // Upload images
    if (req.files?.images?.length) {
      images = await Promise.all(
        req.files.images.map(file => uploadFile(file, "image"))
      );
    }

    // Upload video
    if (req.files?.video?.length) {
      video = await uploadFile(req.files.video[0], "video");
    }

    const review = await reviewModel.create({
      bookingId,
      vendorId: booking.vendorId,
      userId: req.user.id,
      rating: Number(rating),
      comment,
      images,
      video
    });

    return res.status(201).json({
      message: "Review submitted successfully.",
      data: review
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: error.message
    });
  }
};