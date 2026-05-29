const userModel = require('../models/user');
const vendorModel = require('../models/vendor');
const paymentModel = require('../models/payment');
const bookingModel = require('../models/booking');
const otpGenerator = require('otp-generator');
const axios = require('axios');
const mongoose = require('mongoose');

exports.initializePayment = async (req, res) => {
    try{

        const userId = req.user.id;
        const {vendorId, bookingId} = req.params;

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
            amount = Number(booking.totalAmount);
        }

        if (!mongoose.Types.ObjectId.isValid(selectedVendorId)) {
            return res.status(400).json({
                message: 'Invalid vendor ID'
            });
        }

        const user = await userModel.findById(userId);
        if(!user){
            return res.status(404).json({
                message: 'User not found'
            })
        }

        const vendor = await vendorModel.findById(selectedVendorId);
        if(!vendor){
            return res.status(404).json({
                message: 'Vendor not found'
            })
        };

        amount = amount || Number(vendor.bookingFee || vendor.pricing?.minimumPrice);
        if (!amount || amount <= 0) {
            return res.status(400).json({
                message: 'Vendor booking fee has not been set'
            });
        }

        const vendorName = vendor.stageName || `${vendor.firstName} ${vendor.lastName}`;

            //Generate references
        const ref = otpGenerator.generate(12, {specialChars: false, upperCaseAlphabets: false, lowerCaseAlphabets: false})
        const reference = `TCA-FEASTSYNC-${ref}`;

        //Create payment data obaject
        const paymentData = {
            amount, 
            currency: 'NGN',
            reference,
            customer: {
                email: user.email,
                name: user.firstName + ' ' + user.lastName
            },
            metadata: {
                userId,
                vendorId: vendor._id.toString(),
                vendorName,
                bookingId: booking?._id?.toString()
            },
            redirect_url: 'https://www.google.com/'
        }

        //Initialize payment using axios
        const response = await axios.post('https://api.korapay.com/merchant/api/v1/charges/initialize', paymentData, {
            headers: {
                Authorization: `Bearer ${process.env.KORA_API_KEY}`
            }
        })

        //Create a payment record in our database
        const payment = new paymentModel({
            amount: paymentData.amount,
            currency: paymentData.currency,
            reference,
            userId,
            vendorId: vendor._id,
            bookingId: booking?._id,
            vendorName,
            paymentMethod: 'korapay'
        })

        await payment.save();

        //send a success response
        res.status(200).json({
            message: 'Payment initialized successfully',
            data: response.data?.data,
            payment
        })

    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: 'Error initializing payment'
        })
    }
};
exports.verifyPayment = async (req, res)=>{
    try {
        //Extract the reference from the query params
        const {reference} = req.query
        //verify the status of the payment from kora
        const {data} = await axios.get(`https://api.korapay.com/merchant/api/v1/charges/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.KORA_API_KEY}`
            }
        });
         //update the payment in our app
            const payment = await paymentModel.findOne({reference})
            if(!payment){
                return res.status(404).json({
                    message: 'Payment not found'
                })
            }
        //Check the status update
        if(data?.status === true && data?.data.status === 'success'){
           
            //Update the status of the payment
            payment.status = data?.data.status;
            await payment.save()
            
            //send a success response
            return res.status(200).json({
                message: 'Payment verified successfully',
                data: payment
            })
        }else {
            payment.status = data?.data.status
            await payment.save();

             //Send a success response
        return res.status(200).json({
            message: 'payment verifification failed',
            data: payment
        })
        }
       
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: 'Error fetching payment'
        })
    }
};
exports.getAllPaymentByUser = async(req, res)=>{
    try {
        //Extract the User ID from the request user
        const userId = req.user.id;
        //check if user exists
        const user = await userModel.findById(userId)
        if(!user){
            return res.status(404).json({
                message: 'User not found'
            })
        }
        //Find all payments made by the user
        const allPayments = await paymentModel.find({userId}).sort({createdAt: -1});
        //Send a success response
        res.status(200).json({
            message: 'All payments by User',
            data: allPayments
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};