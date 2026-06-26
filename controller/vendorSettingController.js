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
      "stageName email phoneNumber bio stateOfResidence bankName bankCode accountNumber slug calendar pricing kycStatus"
    );

    if (!vendor) {
      return res.status(404).json({
        message: "Vendor not found"
      });
    }

    return res.status(200).json({
      message: "Settings fetched successfully",
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
        message:
          "Display name and legal names cannot be edited"
      });
    }

    // Validate bank details
    const updatingBankDetails =
      req.body.bankName ||
      req.body.bankCode ||
      req.body.accountNumber;

    if (updatingBankDetails) {
      if (
        !req.body.bankName ||
        !req.body.bankCode ||
        !req.body.accountNumber
      ) {
        return res.status(400).json({
          message:
            "bankName, bankCode and accountNumber are required together"
        });
      }
    }

    const OTP = otpGenerator.generate(4, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false
    });

    vendor.pendingUpdate = {
      ...req.body
    };

    vendor.markModified("pendingUpdate");

    vendor.otp = OTP;

    vendor.otpExpires = new Date(
      Date.now() + 5 * 60 * 1000
    );

    await vendor.save();

    await brevo(
      vendor.email,
      vendor.firstName,
      emailTemplate(vendor.firstName, OTP),
      "Your FeastSync OTP"
    );

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

    const vendor = await vendorModel.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({
        message: "Vendor not found"
      });
    }

    if (
      vendor.otp !== otp ||
      !vendor.otpExpires ||
      Date.now() >
        new Date(vendor.otpExpires).getTime()
    ) {
      return res.status(400).json({
        message: "Invalid or expired OTP"
      });
    }

    if (!vendor.pendingUpdate) {
      return res.status(400).json({
        message: "No pending update found"
      });
    }

    const updates = vendor.pendingUpdate;

    // General settings
    if (updates.phoneNumber !== undefined) {
      vendor.phoneNumber = updates.phoneNumber;
    }

    if (updates.bio !== undefined) {
      vendor.bio = updates.bio;
    }

    if (updates.stateOfResidence !== undefined) {
      vendor.stateOfResidence =
        updates.stateOfResidence;
    }

    // Bank details
    if (updates.bankName !== undefined) {
      vendor.bankName = updates.bankName;
    }

    if (updates.bankCode !== undefined) {
      vendor.bankCode = updates.bankCode;
    }

    if (updates.accountNumber !== undefined) {
      vendor.accountNumber =
        updates.accountNumber;
    }

    console.log("BANK DETAILS BEFORE SAVE:", {
      bankName: vendor.bankName,
      bankCode: vendor.bankCode,
      accountNumber: vendor.accountNumber
    });

    vendor.pendingUpdate = null;
    vendor.otp = null;
    vendor.otpExpires = null;

    await vendor.save();

    console.log("BANK DETAILS AFTER SAVE:", {
      bankName: vendor.bankName,
      bankCode: vendor.bankCode,
      accountNumber: vendor.accountNumber
    });

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
        message:
          "Display name and legal names cannot be edited"
      });
    }

    const updatingBankDetails =
      req.body.bankName ||
      req.body.bankCode ||
      req.body.accountNumber;

    if (updatingBankDetails) {
      if (
        !req.body.bankName ||
        !req.body.bankCode ||
        !req.body.accountNumber
      ) {
        return res.status(400).json({
          message:
            "bankName, bankCode and accountNumber are required together"
        });
      }

      if (!/^\d{10}$/.test(req.body.accountNumber)) {
        return res.status(400).json({
          message: "Account number must be 10 digits"
        });
      }
    }

    const OTP = otpGenerator.generate(4, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false
    });

    vendor.pendingUpdate = {
      ...req.body
    };

    vendor.markModified("pendingUpdate");

    vendor.otp = OTP;

    vendor.otpExpires = new Date(
      Date.now() + 5 * 60 * 1000
    );

    await vendor.save();

    await brevo(
      vendor.email,
      vendor.firstName,
      emailTemplate(vendor.firstName, OTP),
      "Your FeastSync OTP"
    );

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

    const vendor = await vendorModel.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({
        message: "Vendor not found"
      });
    }

    if (
      vendor.otp !== otp ||
      !vendor.otpExpires ||
      Date.now() >
        new Date(vendor.otpExpires).getTime()
    ) {
      return res.status(400).json({
        message: "Invalid or expired OTP"
      });
    }

    if (!vendor.pendingUpdate) {
      return res.status(400).json({
        message: "No pending update found"
      });
    }

    Object.assign(
      vendor,
      vendor.pendingUpdate
    );

    console.log("BANK DETAILS BEFORE SAVE:", {
      bankName: vendor.bankName,
      bankCode: vendor.bankCode,
      accountNumber: vendor.accountNumber
    });

    vendor.pendingUpdate = null;
    vendor.otp = null;
    vendor.otpExpires = null;

    await vendor.save();

    console.log("BANK DETAILS AFTER SAVE:", {
      bankName: vendor.bankName,
      bankCode: vendor.bankCode,
      accountNumber: vendor.accountNumber
    });

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
};