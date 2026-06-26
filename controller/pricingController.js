const pricingModel = require('../models/pricing');
const vendorModel = require('../models/vendor');

exports.createPricing = async (req, res) => {
    try {
        const { id } = req.user;
        const { packagePrice, packageName, packageDescription } = req.body;

        const vendor = await vendorModel.findById(id);

        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor not found'
            });
        }

        // Check if package already exists for this vendor
        const existingPackage = await pricingModel.findOne({
            vendorId: vendor._id,
            packageName
        });

        if (existingPackage) {
            return res.status(400).json({
                message: `${packageName} package already exists. Please update it instead.`
            });
        }

        const pricing = await pricingModel.create({
            vendorId: vendor._id,
            packagePrice,
            packageName,
            packageDescription
        });

        vendor.pricingId.push(pricing._id);
        await vendor.save();

        return res.status(201).json({
            message: 'Pricing package created successfully',
            data: pricing
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

exports.updatePricing = async (req, res) => {
    try {
        const vendorId = req.user.id
        const { pricingId } = req.params;
        const pricing = await pricingModel.findById(pricingId);

        if (!pricing) {
            return res.status(404).json({
                message: 'Package not found'
            });
        }
        if (pricing.vendorId.toString() !== vendorId) {
            return res.status(403).json({
                message: 'Unauthorized'
            });
        }
        const updatedPricing = await pricingModel.findByIdAndUpdate(
            pricingId,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: 'Package updated successfully',
            data: updatedPricing
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }
};

exports.getAllVendorPricing = async (req, res) => {
    try {
        const { id } = req.user;
        const pricing = await pricingModel.find({ vendorId: id});
        res.status(200).json({
            message: 'Pricing packages retrieved successfully',
            totalPackages: pricing.length,
            data: pricing
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Something went wrong'
        });
    }
};

exports.getOnePricing = async (req, res) => {
  try {
    const { pricingId } = req.params;
    const pricing = await pricingModel.findById(pricingId)
    if (!pricing) {
      return res.status(404).json({
        message: "Package not found"
      });
    }
    return res.status(200).json({
      message: "Package retrieved successfully",
      data: pricing
    });

  } catch (error) {
    console.log(error.message);

    return res.status(500).json({
      message: "Something went wrong"
    });
  }
};