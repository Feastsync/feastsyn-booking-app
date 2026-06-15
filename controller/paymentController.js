const userModel = require('../models/user');
const vendorModel = require('../models/vendor');
const paymentModel = require('../models/payment');
const bookingModel = require('../models/booking');
const pricingModel = require('../models/pricing');
const otpGenerator = require('otp-generator');
const axios = require('axios');
const mongoose = require('mongoose');

exports.initializePayment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { vendorId, bookingId } = req.params;

        let booking;
        let selectedVendorId = vendorId;
        let amount;

        if (bookingId) {
            if (!mongoose.Types.ObjectId.isValid(bookingId)) {
                return res.status(400).json({
                    message: 'Invalid booking ID'
                });
            }

            booking = await bookingModel.findOne({ _id: bookingId, userId });

            if (!booking) {
                return res.status(404).json({
                    message: 'Booking not found for this user'
                });
            }

            if (booking.paymentStatus !== 'unpaid') {
                return res.status(400).json({
                    message: 'This booking has already been paid for'
                });
            }

            selectedVendorId = booking.vendorId;

            if (booking.pricingId) {
                const pricing = await pricingModel.findById(booking.pricingId);

                if (!pricing) {
                    return res.status(404).json({
                        message: 'Pricing package not found'
                    });
                }

                amount = pricing.packagePrice;
            }
        }
        if (!mongoose.Types.ObjectId.isValid(selectedVendorId)) {
            return res.status(400).json({
                message: 'Invalid vendor ID'
            });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const vendor = await vendorModel.findById(selectedVendorId);
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor not found'
            });
        }

        if (!amount) {
            if (vendor.bookingFee != null) {
                amount = vendor.bookingFee;
            } else {
                return res.status(400).json({
                    message: 'Vendor booking fee has not been set'
                });
            }
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({
                message: 'Invalid payment amount'
            });
        }

        const vendorName = vendor.stageName || `${vendor.firstName} ${vendor.lastName}`;

        const ref = otpGenerator.generate(12, {
            specialChars: false,
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false
        });

        const reference = `TCA-FEASTSYNC-${ref}`;

        const paymentData = {
            amount,
            currency: 'NGN',
            reference,
            customer: {
                email: user.email,
                name: `${user.firstName} ${user.lastName}`
            },
            metadata: {
                userId,
                vendorId: vendor._id.toString(),
                vendorName,
                bookingId: booking?._id?.toString()
            },
            redirect_url: 'https://www.feastsync.com/',
            notification_url: 'https://feastsyn-booking-app.onrender.com/webhook'
        };

        const response = await axios.post(
            'https://api.korapay.com/merchant/api/v1/charges/initialize',
            paymentData,
            {
                headers: {
                    Authorization: `Bearer ${process.env.KORA_API_KEY}`
                }
            }
        );

        const payment = new paymentModel({
            amount,
            currency: paymentData.currency,
            reference,
            userId,
            vendorId: vendor._id,
            bookingId: booking?._id,
            vendorName,
            paymentMethod: 'korapay'
        });

        await payment.save();

        return res.status(200).json({
            message: 'Payment initialized successfully',
            data: response.data?.data,
            payment
        });

    } catch (error) {
        console.log(error.message);

        return res.status(500).json({
            message: 'Error initializing payment'
        });
    }
};

exports.verifyWebhook = async (req, res) => {
    try {
        const { event, data } = req.body;
        const hash = crypto.createHmac("sha256", secretKey).update(JSON.stringify(data)).digest("hex");
        const signature = req.headers["x-korapay-signature"];
        if (hash !== signature) return res.status(401).json({
            message: "Invalid webhook signature"
        });
        const payment = await paymentModel.findOne({ reference: `TCA-FEASTSYNC-${data.reference}` })
        if (!payment) return res.status(404).json({
            message: "NO payment record found"
        });

        if (event === 'charge.success') {
            payment.paymentStatus = 'successful'
            await payment.save()
        } else if (event === 'charge.pending') {
            payment.paymentStatus = 'processing'
            await payment.save()
        } else if (event === 'charge.failed') {
            payment.paymentStatus = 'failed'
            await payment.save()
        };

        await payment.save();
        res.status(200)
    } catch (error) {
        console.log(error.message)
        next(error)
    }

};


exports.getAllPaymentByUser = async (req, res) => {
    try {
        //Extract the User ID from the request user
        const userId = req.user.id;
        //check if user exists
        const user = await userModel.findById(userId)
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }
        //Find all payments made by the user
        const allPayments = await paymentModel.find({ userId }).sort({ createdAt: -1 });
        //Send a success response
        res.status(200).json({
            message: 'All payments by User retrieved successfully',
            data: allPayments
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};