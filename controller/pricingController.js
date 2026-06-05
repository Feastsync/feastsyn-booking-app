const pricingModel = require('../models/pricing');
const vendorModel = require('../models/vendor');

exports.createPricing = async (req, res) => {
    try {
        const { id } = req.user;
        const { minimumPrice, bookingFee, packageName, packageDescription} = req.body;
        const vendor = await vendorModel.findById(id);
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor not found'
            });
        }
        const pricing = await pricingModel.create({
            vendorId: vendor._id,
            minimumPrice,
            bookingFee,
            packageName,
            packageDescription
        });
        res.status(201).json({
            message: 'Pricing package created successfully',
            data: pricing
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Something went wrong'
        });
    }
};

exports.getAllVendorPricing = async (req, res) => {
    try {
        const { id } = req.user;
        const pricing = await pricingModel.find({
            vendorId: id
        });

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
        const { id } = req.params;
        const pricing = await pricingModel.findById(id);

        if (!pricing) {
            return res.status(404).json({
                message: 'Package not found'
            });
        }

        res.status(200).json({
            message: 'Package retrieved successfully',
            data: pricing
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Something went wrong'
        });
    }
};
exports.updatePricing = async (req, res) => {
    try {
        const { id } = req.params;
        const pricing = await pricingModel.findById(id);

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
        const updatedPricing = await pricingModel.findByIdAndUpdate(
            id,
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

exports.deletePricing = async (req, res) => {
    try {
        const { id } = req.params;
        const pricing = await pricingModel.findById(id);

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
        await pricingModel.findByIdAndDelete(id);
        res.status(200).json({
            message: 'Package deleted successfully'
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Something went wrong'
        });
    }
};