const message = require('../models/message');
const userModel = require('../models/user');
const bookingModel = require('../models/booking');
const vendorModel = require('../models/vendor')

let ioInstance
exports.initializeIO = (io) => {
  ioInstance = io;
  console.log("Socket.io instance initialized");
};
exports.getMessages = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const booking = await bookingModel.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.bookingStatus !== "confirmed" || booking.paymentStatus !== "paid") {
      return res.status(403).json({
        message: "Messages are only available after booking confirmation and payment.",});
    }

    const senderId = req.user.id;

    const receiverId =
      booking.vendorId.toString() === senderId
        ? booking.userId
        : booking.vendorId;

    if (!receiverId) {
      return res.status(400).json({
        message: "You have not been assigned to a user yet",
      });
    }

    const messages = await message
      .find({
        roomId: bookingId,
      })
      .populate("senderId", "firstName lastName role")
      .populate("receiverId", "firstName lastName role")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      message: `Found ${messages.length} messages for this booking`,
      data: messages,
    });
  } catch (err) {
    console.error("Error fetching messages:", err);

    return res.status(500).json({
      message: "Failed to get messages",
      error: err.message,
    });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { text, senderId, receiverId, roomId } = req.body;
    const { bookingId } = req.params;

    if (!bookingId || !text || !senderId || !receiverId || !roomId) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const newMessage = await message.create({
      senderId,
      receiverId,
      text,
      roomId,
    });

    const fullMessage = await message
      .findById(newMessage._id)
      .populate("senderId", "firstName lastName role")
      .populate("receiverId", "firstName lastName role");

    if (ioInstance) {
      ioInstance.to(roomId).emit("receive_message", fullMessage);
    }

    return res.status(201).json({
      message: "Message sent successfully",
      data: fullMessage,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed to send message",
      details: err.message,
    });
  }
};

exports.getMessagesByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Validate room format
    if (!roomId || !roomId.startsWith("feastsync_")) {
      return res.status(400).json({
        message: "Invalid roomId format",
      });
    }

    // Extract bookingId
    const bookingId = roomId.replace("feastsync_", "");

    // Verify booking exists
    const booking = await bookingModel.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // Fetch messages
    const messages = await message
      .find({ roomId })
      .populate("senderId", "firstName lastName role")
      .populate("receiverId", "firstName lastName role")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      message: `Found ${messages.length} messages`,
      data: messages,
    });
  } catch (err) {
    console.error("Error fetching messages:", err);

    return res.status(500).json({
      message: "Failed to fetch messages",
      error: err.message,
    });
  }
};