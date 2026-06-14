const pricingModel = require('../models/pricing');
const vendorModel = require('../models/vendor');

exports.createPricing = async (req, res) => {
    try {
        const { id } = req.user;
        const { packagePrice, packageName, packageDescription} = req.body;
        const vendor = await vendorModel.findById(id);
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor not found'
            });
        }
        const pricing = await pricingModel.create({
            vendorId: vendor._id,
            packagePrice,
            packageName,
            packageDescription
        });
        res.status(201).json({
            message: 'Pricing package created successfully',
            data: pricing
        });
    } catch (error) { 
        res.status(500).json({
            message: error.message
        });
    }
};

exports.updatePricing = async (req, res) => {
    try {
        const { pricingId } = req.params;
        const pricing = await pricingModel.findById(pricingIdd);

        if (!pricing) {
            return res.status(404).json({
                message: 'Package not found'
            });
        }
        if (pricing.vendorId.toString() !== id) {
            return res.status(403).json({
                message: 'Unauthorized'
            });
        }
        const updatedPricing = await pricingModel.findByIdAndUpdate( id,
            req.body,
            addMorePackages,
            { new: true }
        );

        res.status(200).json({
            message: 'Package updated successfully',
            data: updatedPricing
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Something went wrong'
        });
    }
};