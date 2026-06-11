// sockets/chatSocket.js
const jwt = require("jsonwebtoken");
const messageModel = require("../models/message");

function initializeChatSocket(io) {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Step 1: Authenticate user using token
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.log("No token provided — disconnecting socket");
      return socket.disconnect(true);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      socket.userId = decoded.id;
      console.log(`Authenticated user: ${socket.userId}`);
    } catch (error) {
      console.log("Invalid token — disconnecting socket");
      return socket.disconnect(true);
    }

    // Step 2: Join private room between sender & receiver
    socket.on("join_room", ({ senderId, receiverId }) => {
      const roomId = [senderId, receiverId].sort().join("_");
      socket.join(roomId);
      socket.roomId = roomId; // store room ID for later use
      console.log(`User ${senderId} joined room ${roomId}`);
    });

    // Step 3: When user sends a message
    socket.on("send_message", async (data) => {
      const { senderId, receiverId, text } = data;
      const roomId = [senderId, receiverId].sort().join("_");

      if (!senderId || !receiverId || !text) {
        console.error("Missing message data");
        return;
      }

      try {
        // Save message including roomId
        const message = await messageModel.create({
          senderId,
          receiverId,
          text,
          roomId, 
        });

        // Send message to both participants in the room
        io.to(roomId).emit("receive_message", message);
        console.log(`Message saved & sent in room ${roomId}`);
      } catch (error) {
        console.error("Error saving message:", error.message);
      }
    });

    // Step 4: Disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}

module.exports = initializeChatSocket;