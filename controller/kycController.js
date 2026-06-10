const kycModel = require('../models/kyc')
const vendorModel = require('../models/vendor')
const cloudinary = require('../utils/cloudinary')
const fs = require('fs');
const path = require('path')

exports.uploadKyc = async (req, res) => {
  try {
    const vendorId = req.user.id;
    if (!req.file) {
      return res.status(400).json({
        message: 'Please upload an ID document'
      });
    }
    const uploaded = await cloudinary.uploader.upload(
      req.file.path,
      {
        resource_type: 'image'
      }
    );
    await fs.promises.unlink(req.file.path);

    const kyc = await kycModel.create({
      vendorId,
      documentImage: {
        secureUrl: uploaded.secure_url,
        documentImageId: uploaded.public_id
      }
    });
    res.status(201).json({
      message: 'KYC submitted successfully',
      data: kyc
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.approveKyc = async (req, res) => {
  try {
    const { kycId } = req.params;
    const kyc = await kycModel.findById(kycId);

    if (!kyc) {
      return res.status(404).json({
        message: 'KYC record not found'
      });
    }
    kyc.verificationStatus = 'verified';
    await kyc.save();
    await vendorModel.findByIdAndUpdate(kyc.vendorId,
      {
        isKycVerified: true
      }
    );
    return res.status(200).json({
      message: 'KYC approved successfully'
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

exports.rejectKyc = async (req, res) => {
  try {
    const { kycId } = req.params;
    const { rejectionReason } = req.body;

    const kyc = await kycModel.findById(kycId);

    if (!kyc) {
      return res.status(404).json({
        message: 'KYC record not found'
      });
    }

    kyc.verificationStatus = 'rejected';
    kyc.rejectionReason = rejectionReason;

    await kyc.save();

    return res.status(200).json({
      message: 'KYC rejected successfully'
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

exports.getPendingKycs = async (req, res) => {
  try {
    const kycs = await kycModel.find({ verificationStatus: 'processing' }).populate(
        'vendorId',
        'firstName lastName email stageName'
      );
    return res.status(200).json({
      message: 'All pending KYCs retrieved successfully',   
      count: kycs.length,
      data: kycs
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};