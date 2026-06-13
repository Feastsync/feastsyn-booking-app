const jwt = require("jsonwebtoken");
const userModel = require("../models/user");
const vendorModel = require("../models/vendor");

exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.id);

    if (user) {
      req.user = user;
      return next();
    }

    const vendor = await vendorModel.findById(decoded.id);

    if (vendor) {
      req.vendor = vendor;
      return next();
    }

    return next();
  } catch (error) {
    return next();
  }
};