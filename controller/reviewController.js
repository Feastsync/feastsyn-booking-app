const userModel = require("../models/user");
const vendorModel = require("../models/vendor");
const reviewModel = require("../models/review");
const bookingModel = require("../models/booking");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");
const { createNotification } = require("../utils/createNotification");
const { vendorReviewReceivedTemplate, userReviewSubmittedTemplate} = require("../email");

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

        // Ensure logged-in user owns the booking
        if (booking.userId.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Unauthorized"
            });
        }

        // Only completed bookings can be reviewed
        if (
            !booking.isEventConfirmed ||
            booking.bookingStatus !== "completed"
        ) {
            return res.status(400).json({
                message: "You can only review a completed service."
            });
        }

        if (!rating || Number(rating) < 1 || Number(rating) > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5."
            });
        }

        // Prevent duplicate review
        const existingReview = await reviewModel.findOne({
            bookingId
        });

        if (existingReview) {
            return res.status(400).json({
                message: "Review already submitted."
            });
        }

        // Upload helper
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

        // Upload Images
        if (req.files?.images?.length) {
            images = await Promise.all(
                req.files.images.map(file =>
                    uploadFile(file, "image")
                )
            );
        }

        // Upload Video
        if (req.files?.video?.length) {
            video = await uploadFile(
                req.files.video[0],
                "video"
            );
        }

        // Create Review
        const review = await reviewModel.create({
            bookingId,
            vendorId: booking.vendorId,
            userId: req.user.id,
            rating: Number(rating),
            comment,
            images,
            video
        });

        const vendor = await vendorModel.findById(booking.vendorId);
        const user = await userModel.findById(booking.userId);

        if (!vendor || !user) {
            return res.status(404).json({
                message: "User or Vendor not found."
            });
        }

        // ============================
        // Notify Vendor
        // ============================
        await createNotification({
            recipientId: vendor._id,
            recipientType: "vendor",
            recipientModel: "vendors",

            senderId: user._id,
            senderModel: "users",

            bookingId: booking._id,

            notificationType: "review_received",

            title: "New Review Received",

            message: `${user.firstName} ${user.lastName} left you a ${rating}-star review.`,

            emailSubject: "New Review Received",

            emailBody: vendorReviewReceivedTemplate(
                vendor.stageName,
                `${user.firstName} ${user.lastName}`,
                rating,
                comment
            )
        });

        // ============================
        // Notify User
        // ============================
        await createNotification({
            recipientId: user._id,
            recipientType: "user",
            recipientModel: "users",

            senderId: vendor._id,
            senderModel: "vendors",

            bookingId: booking._id,

            notificationType: "review_submitted",

            title: "Review Submitted",

            message: `Thank you! Your review for ${vendor.stageName} has been submitted successfully.`,

            emailSubject: "Review Submitted",

            emailBody: userReviewSubmittedTemplate(
                user.firstName,
                vendor.stageName
            )
        });

        return res.status(201).json({
            success: true,
            message: "Review submitted successfully.",
            data: review
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};