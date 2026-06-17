const vendorModel = require('../models/vendor');
const otpGenerator = require('otp-generator');
const { brevo } = require('../utils/brevo');
const { emailTemplate } = require('../email');

exports.getSettings = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const vendor = await vendorModel.findById(vendorId).select(
                'stageName firstName lastName email phoneNumber bio stateOfResidence bankName accountNumber slug kycStatus');
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor not found'
            });
        }
        return res.status(200).json({
            message: 'Settings fetched successfully',
            data: vendor
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });

    }
};

exports.requestUpdate = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const vendor = await vendorModel.findById(vendorId);

        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor not found'
            });
        }

        // Prevent display name update
        if (req.body.stageName || req.body.firstName || req.body.lastName) {
            return res.status(400).json({
                message: 'Display name and legal names cannot be edited'
            });
        }

        const OTP = otpGenerator.generate(4, {upperCaseAlphabets: false,lowerCaseAlphabets: false,specialChars: false});
        vendor.pendingUpdate = req.body;
        vendor.otp = OTP;
        vendor.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await vendor.save();
        await brevo(vendor.email,vendor.firstName,OTP,emailTemplate(vendor.firstName, OTP));
        return res.status(200).json({
            message: 'OTP sent successfully to your email'});
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });

    }
};

exports.confirmUpdate = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { otp } = req.body;
        const vendor = await vendorModel.findById( vendorId);

        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor not found'
            });
        }

        if (vendor.otp !== otp || Date.now() > vendor.otpExpiresAt) {
            return res.status(400).json({
                message: 'Invalid OTP'
            });
        }

        if (!vendor.pendingUpdate) {
            return res.status(400).json({
                message: 'No pending update found'
            });
        }

        Object.assign( vendor, vendor.pendingUpdate );

        vendor.pendingUpdate = null;

        vendor.otp = null;

        vendor.otpExpiresAt = null;

        await vendor.save();

        return res.status(200).json({
            message: 'Settings updated successfully',
            data: vendor
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });

    }
};