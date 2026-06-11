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
