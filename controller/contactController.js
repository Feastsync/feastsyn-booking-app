const {brevo} = require("../utils/brevo");
const userModel = require('../models/user');
const vendorModel = require('../models/vendor')
const contactModel = require("../models/contact");

exports.contactUs = async (req, res) => {
  try {
    const {firstName, lastName, email, phoneNumber, message} = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !message) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const contactMessage = await contactModel.create({
      userId: req.user?._id || null,
      vendorId: req.vendor?._id || null,
      senderType: req.user ? "user" : req.vendor ? "vendor" : "guest",
      firstName,
      lastName,
      email,
      phoneNumber,
      message
    });

    const fullName = `${firstName} ${lastName}`;

    const emailMessage = `
      New contact message from ${fullName}

      Email: ${email}
      Phone Number: ${phoneNumber}
      Sender Type: ${contactMessage.senderType}

      Message:
      ${message}
    `;

    await brevo(process.env.USER_EMAIL,fullName,emailMessage,
      "New Contact Message"
    );

    return res.status(201).json({
      message: "Message sent successfully",
      data: contactMessage
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};