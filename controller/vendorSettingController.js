const vendorModel = require('../models/vendor');
const otpGenerator = require('otp-generator');
const { brevo } = require('../utils/brevo');
const { emailTemplate } = require('../email');
const pricingModel = require('../models/pricing')
const calendarModel = require('../models/calendar')

exports.getSettings = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const vendor = await vendorModel.findById(vendorId).select(
                'stageName email phoneNumber bio stateOfResidence bankName accountNumber slug calendar pricing kycStatus');
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
                message: "Vendor not found"
            });
        }

        if (req.body.stageName) {
            return res.status(400).json({
                message: "Display name and legal names cannot be edited"
            });
        }

        const OTP = otpGenerator.generate(4, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        });

        console.log("OLD OTP:", vendor.otp);

        vendor.pendingUpdate = { ...req.body };

        vendor.markModified("pendingUpdate");

        vendor.otp = OTP;

        vendor.otpExpiresAt = new Date(
            Date.now() + 5 * 60 * 1000
        );

        await vendor.save();

        const updatedVendor =
            await vendorModel.findById(vendorId);

        console.log(
            "OTP SAVED:",
            updatedVendor.otp
        );

        console.log(
            "OTP EXPIRY:",
            updatedVendor.otpExpiresAt
        );

        try {
            await brevo(
                vendor.email,
                vendor.firstName,
                OTP,
                emailTemplate(
                    vendor.firstName,
                    OTP
                )
            );

            console.log(
                "OTP EMAIL SENT TO:",
                vendor.email
            );

        } catch (emailError) {
            console.error(
                "BREVO ERROR:",
                emailError.response?.data ||
                emailError.message
            );

            return res.status(500).json({
                message:
                    "Failed to send OTP email"
            });
        }

        return res.status(200).json({
            message:
                "OTP sent successfully to your email"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: error.message
        });
    }
};

exports.confirmUpdate = async (req, res) => {
    try {
        const vendorId = req.user.id;

        const { otp } = req.body;

        const vendor =
            await vendorModel.findById(vendorId);

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor not found"
            });
        }

        if (
            vendor.otp !== otp ||
            !vendor.otpExpiresAt ||
            Date.now() >
                new Date(vendor.otpExpiresAt).getTime()
        ) {
            return res.status(400).json({
                message:
                    "Invalid or expired OTP"
            });
        }

        if (!vendor.pendingUpdate) {
            return res.status(400).json({
                message:
                    "No pending update found"
            });
        }

        Object.assign(
            vendor,
            vendor.pendingUpdate
        );

        vendor.pendingUpdate = null;
        vendor.otp = null;
        vendor.otpExpiresAt = null;

        await vendor.save();

        return res.status(200).json({
            message:
                "Settings updated successfully",
            data: vendor
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: error.message
        });
    }
};;