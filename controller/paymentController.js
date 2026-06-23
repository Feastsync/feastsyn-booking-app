const userModel = require('../models/user');
const vendorModel = require('../models/vendor');
const paymentModel = require('../models/payment');
const bookingModel = require('../models/booking');
const pricingModel = require('../models/pricing');
const otpGenerator = require('otp-generator');
const axios = require('axios');
const mongoose = require('mongoose');
const walletModel = require('../models/wallet')
const transactionModel = require('../models/transaction');
const escrowModel = require('../models/escrow')
const crypto = require('crypto');
const calendarModel = require('../models/calendar');

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

if (booking.paymentStatus === 'paid') {
    return res.status(400).json({
        message: 'This booking has already been paid for'
    });
}

if (!['accepted', 'confirmed'].includes(booking.bookingStatus)) {
    return res.status(400).json({
        message: 'This booking has not been accepted by the vendor yet'
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
            redirect_url: 'https://feast-sync.vercel.app/chats/',
            notification_url: 'https://feastsync-api.onrender.com/api/v1/payment/webhook'
        };
        console.log(paymentData)
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
            vendorName
        });

        await payment.save();

        return res.status(200).json({
            message: 'Payment initialized successfully',
            data: response.data?.data,
            payment
        });

    } catch (error) {
    console.log("FULL ERROR:", error);

    if (error.response) {
        console.log("KORA ERROR:", error.response.data);
    }

    return res.status(500).json({
        message: error.message,
        error: error.response?.data || error
    });
}
};


exports.verifyWebhook = async (req, res) => {
    try {
        const { event, data } = req.body;
        console.log('checking for webhook')
        const hash = crypto.createHmac("sha256", process.env.KORA_API_KEY).update(JSON.stringify(data)).digest("hex");
        
        const signature = req.headers["x-korapay-signature"];
        
        if (hash !== signature) {
            return res.status(401).json({
                message: "Invalid webhook signature"
            });
        }
        
        const payment = await paymentModel.findOne({ reference: data.reference });
        console.log("PAYMENT:", payment);
        console.log("VENDOR ID:", payment.vendorId);
        console.log("BOOKING ID:", payment.bookingId);
          
        if (!payment) {
            return res.status(404).json({
                message: "No payment record found"
            });
        }
        
        if (event === "charge.success") {

    if(payment.paymentStatus === "successful") {
        return res.status(200).json({
            message: "Payment already processed"
        });
    }

    payment.paymentStatus = "successful";
    await payment.save();
        
            // Update booking
    if (payment.bookingId) {
    const booking = await bookingModel.findByIdAndUpdate(
        payment.bookingId,
        {
            paymentStatus: "paid",
            bookingStatus: "confirmed"
        },
        {
            new: true
        }
    );

    if (booking) {
        await calendarModel.findOneAndUpdate(
            {
                vendorId: booking.vendorId,
                date: booking.eventDate
            },
            {
                vendorId: booking.vendorId,
                date: booking.eventDate,
                isBooked: true
            },
            {
                upsert: true,
                new: true
            }
        );
    }
}

            console.log("REACHED ESCROW/WALLET SECTION");
            // ESCROW CALCULATIONS
            const totalAmount = Number(payment.amount);
            
            // FeastSync Commission (5%)
            const commissionAmount = totalAmount * 0.05;
            
            // Vendor gets remaining 95%
            const vendorAmount = totalAmount - commissionAmount;
            
            // 70% released immediately
            const firstReleaseAmount = vendorAmount * 0.70;
            
            // 30% held in escrow
            const finalReleaseAmount = vendorAmount * 0.30;
            
            // CREATE ESCROW RECORD
            const existingEscrow = await escrowModel.findOne({ paymentId: payment._id });
            if (!existingEscrow) {
                await escrowModel.create({
                    bookingId: payment.bookingId,
                    vendorId: payment.vendorId,
                    paymentId: payment._id,
                    
                    totalAmount,
                    commissionAmount,
                    
                    firstReleaseAmount,
                    finalReleaseAmount,

                    firstReleaseStatus: "released",
                    finalReleaseStatus: "pending"
                });
            }
            // CREATE / UPDATE WALLET
            let wallet = await walletModel.findOne({ vendorId: payment.vendorId });
            
            console.log("WALLET BEFORE:", wallet);
            if (!wallet) {
            wallet = await walletModel.create({
            vendorId: payment.vendorId,
            availableBalance: 0,
            escrowBalance: 0,
            totalEarned: 0,
            withdrawnAmount: 0,
            totalTransactions: 0
  });

  console.log("NEW WALLET CREATED:", wallet);
}
        
            wallet.availableBalance +=
            firstReleaseAmount;

            wallet.escrowBalance +=
            finalReleaseAmount;

            wallet.totalEarned +=
            vendorAmount;
            
            wallet.totalTransactions += 1;

            await wallet.save();

            console.log("WALLET AFTER:", wallet);
            // TRANSACTION RECORDS
            await transactionModel.create({
                vendorId: payment.vendorId,
                bookingId: payment.bookingId,
                amount: commissionAmount,
                transactionType: "commission",
                description: "platform commission",
                status: "successful"
            });
            
            await transactionModel.create({
                vendorId: payment.vendorId,
                bookingId: payment.bookingId,
                amount: firstReleaseAmount,
                transactionType: "release",
                description: "70% milestone released",
                status: "successful"
            });

            await transactionModel.create({
                vendorId: payment.vendorId,
                bookingId: payment.bookingId,
                amount: finalReleaseAmount,
                transactionType: "escrow",
                description: "30% held in escrow",
                status: "pending"
            });
            
            return res.status(200).json({
                status: true,
                message: "Payment verified successfully"
            });
        }
        
        if (event === "charge.pending") {
            console.log('checking for pending webhook')
            payment.paymentStatus = "processing";
            await payment.save();
            
            return res.status(200).json({
                message: "Payment marked as processing"
            });
        }
        
        if (event === "charge.failed") {
            payment.paymentStatus = "failed";
            await payment.save();
            
            return res.status(200).json({
                message: "Payment marked as failed"
            });
        }
        
        return res.status(200).json({
            message: "Webhook received"
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: error.message
        });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        //Extract the reference from the query params
        const { reference } = req.query
        //verify the status of the payment from kora
        const { data } = await axios.get(`https://api.korapay.com/merchant/api/v1/charges/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.KORA_API_KEY}`
            }
        });
        //update the payment in our app
        const payment = await paymentModel.findOne({ reference })
        if (!payment) {
            return res.status(404).json({
                message: 'Payment not found'
            })
        }
        //Check the status update
        if (data?.status === true && data?.data.status === 'success') {

            //Update the status of the payment
            payment.status = data?.data.status;
            await payment.save()

            //send a success response
            return res.status(200).json({
                message: 'Payment verified successfully',
                data: payment
            })
        } else {
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
}

exports.payoutFunds = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { amount } = req.body;

        const vendor = await vendorModel.findById(vendorId);

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor not found"
            });
        }

        if (!vendor.bankName || !vendor.accountNumber || !vendor.bankCode) {
            return res.status(400).json({
                message: "Please update your bank details first"
            });
        }

        const wallet = await walletModel.findOne({ vendorId });

        if (!wallet) {
            return res.status(404).json({
                message: "Wallet not found"
            });
        }

        const withdrawalAmount = Number(amount);

        if (!withdrawalAmount || withdrawalAmount <= 0) {
            return res.status(400).json({
                message: "Invalid withdrawal amount"
            });
        }

        if (withdrawalAmount < 100) {
            return res.status(400).json({
                message: "Minimum withdrawal amount is ₦100"
            });
        }

        if (wallet.availableBalance < withdrawalAmount) {
            return res.status(400).json({
                message: "Insufficient available balance"
            });
        }

        if (!/^\d{10}$/.test(vendor.accountNumber)) {
            return res.status(400).json({
                message: "Invalid account number"
            });
        }

        const ref = otpGenerator.generate(12, {specialChars: false,upperCaseAlphabets: false,lowerCaseAlphabets: false});

        const reference = `FS-PAYOUT-${ref}`;

        const response = await axios.post(
            "https://api.korapay.com/merchant/api/v1/transactions/disburse",
            {
                reference,
                destination: {
                    type: "bank_account",
                    amount: withdrawalAmount,
                    currency: "NGN",
                    narration: "FeastSync Vendor Withdrawal",

                    customer: {
                        name: vendor.stageName || `${vendor.firstName} ${vendor.lastName}`,
                        email: vendor.email
                    },

                    bank_account: {
                        bank: vendor.bankCode,
                        account: vendor.accountNumber
                    }
                }
            }, 
            {
                headers: {
                    Authorization: `Bearer ${process.env.KORA_API_KEY}`,
                    "Content-Type": "application/json"
                }
            } 
        );

        // Save payout record
        const payout = await payoutModel.create({
            vendorId,
            amount: withdrawalAmount,
            reference,
            bankName: vendor.bankName,
            accountNumber: vendor.accountNumber,
            status: "processing"
        });

        // Reserve the funds immediately
        wallet.availableBalance -= withdrawalAmount;
        wallet.pendingWithdrawals += withdrawalAmount;
        wallet.totalTransactions += 1;

        await wallet.save();

        // Create transaction
        await transactionModel.create({
            vendorId,
            amount: withdrawalAmount,
            transactionType: "withdrawal",
            status: "pending",
            reference,
            description: "Withdrawal initiated"
        });

        return res.status(200).json({
            message: "Withdrawal initiated successfully",
            payout,
            walletBalance: wallet.availableBalance
        });

    } catch (error) {

        console.log(
            "Payout Error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            message: error.response?.data?.message || error.message
        });
    }
};