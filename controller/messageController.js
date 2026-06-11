const message = require('../models/message');
const userModel = require('../models/user');
const bookingModel = require('../models/booking');


exports.initializeIO = (io) => {
  ioInstance = io;
  console.log("Socket.io instance initialized");
};
exports.getMessages = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const booking = await bookingModel.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const senderId = req.user.id;
    const receiverId = bookingModel.vendorId === senderId ? bookingModel.userId : bookingModel.vendorId;

    if (!receiverId) return res.status(400).json({ message: "You have not been assigned to user yet" });

    

    const messages = await Message.findAll({
      where: { roomId: `feastsync_${bookingId}`
 },
      include: [
        { model: User, as: "sender", attributes: ["id", "firstName", "lastName", "role"] },
        { model: User, as: "receiver", attributes: ["id", "firstName", "lastName", "role"] },
      ],
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json({
      message:` Found ${messages.length} messages for this errand`,
      data: messages,
    });
  } catch (err) {
    console.error("Error fetching messages:", err.message);
    res.status(500).json({ message: "Failed to get messages", error: err.message });
  }
};


exports.sendMessage = async (req, res) => {
  try {
    const { text, senderId, receiverId, roomId } = req.body;
    const { bookingId } = req.params;

    if (!bookingId || !text || !senderId || !receiverId || !roomId) {
      return res.status(400).json({
        error: "Missing text, senderId, receiverId, errandId or roomId",
      });
    }

    // Save message
    const message = await Message.create({
      senderId,
      receiverId,
      text,
      roomId,
    });

    // Fetch full message with relations
    const fullMessage = await Message.findById(message.id, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "firstName", "lastName", "role"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["id", "firstName", "lastName", "role"],
        },
      ],
    });

    // REAL-TIME EMIT
    if (ioInstance) {
      ioInstance.to(roomId).emit("receive_message", fullMessage);
      console.log( `Emitted message to room: ${roomId}`);
    } else {
      console.log("Socket.io not initialized");
    }

    // API Response
    res.status(201).json({
      message: "Message sent successfully",
      data: fullMessage,
    });

  } catch (err) {
    console.error("Error sending message:", err.message);
    res.status(500).json({
      error: "Failed to send message",
      details: err.message,
    });
  }
};

exports.getMessagesByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Validate roomId format
    if (!roomId || !roomId.startsWith("errand_")) {
      return res.status(400).json({ message: "Invalid roomId format." });
    }

    // Extract actual errandId
    const bookingId = roomId.replace("feastsync_", "");

    // Check errand exists
    const booking = await bookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Fetch messages for this room ONLY
    const messages = await Message.findAll({
      where: { roomId }, 
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "firstName", "lastName", "role"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["id", "firstName", "lastName", "role"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    res.json({
      message: `Found ${messages.length} messages`,
      data: messages,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch messages",
      error: err.message,
    });
  }
};