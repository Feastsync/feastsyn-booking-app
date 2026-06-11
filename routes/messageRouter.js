const express = require('express');
const { authentication } = require('../middlewares/auth');
const { sendMessage, getMessages,getMessagesByRoom } = require('../controller/messageController');

const router = express.Router();

 router.get("/messages/history/:roomId", getMessagesByRoom);
/**
 * @swagger
 * /api/v1/messages/{errandId}:
 *   post:
 *     summary: Send a message for a specific errand
 *     description: Allows an authenticated user (Client or Runner) to send a message linked to a specific errand.  
 *                  The errandId is passed in the URL parameters, and only the text of the message is sent in the body.
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: errandId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the errand the message belongs to
 *         example: 3d2f9b2e-77b5-4d85-94b3-233cf79a7e10
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Hey, are you still available to pick up the package?"
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Message sent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 1a2b3c4d5e
 *                     text:
 *                       type: string
 *                       example: "Hey, are you still available to pick up the package?"
 *                     sender:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: f3f0b08b-d77b-4d0b-84f7-90ac346b6a77
 *                         firstName:
 *                           type: string
 *                           example: Daniel
 *                         lastName:
 *                           type: string
 *                           example: Johnson
 *                     receiver:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: 9dfb93e9-7e73-42b7-a8c0-f6c3ef8f84b1
 *                         firstName:
 *                           type: string
 *                           example: Sarah
 *                         lastName:
 *                           type: string
 *                           example: Doe
 *       400:
 *         description: Missing text or errand not assigned yet
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Errand has no assigned user yet
 *       404:
 *         description: Errand not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Errand not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                  example: Failed to send message
 */
router.post('/:errandId', sendMessage);


/**
 * @swagger
 * /api/v1/messages/{errandId}:
 *   get:
 *     summary: Get all messages for a specific errand
 *     description: Retrieve all chat messages exchanged between the Client and Runner for a particular errand.
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: errandId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the errand to fetch messages for
 *         example: 3d2f9b2e-77b5-4d85-94b3-233cf79a7e10
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Messages retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: 1a2b3c4d5e
 *                       text:
 *                         type: string
 *                         example: "Package picked up already"
 *                       senderId:
 *                         type: string
 *                         example: f3f0b08b-d77b-4d0b-84f7-90ac346b6a77
 *                       receiverId:
 *                         type: string
 *                         example: 9dfb93e9-7e73-42b7-a8c0-f6c3ef8f84b1
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-11-11T09:30:00.000Z
 *       404:
 *         description: No messages found for this errand
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No messages found for this errand
 *       500:
 *         description: Internal Server Error
 */
router.get('/:errandId', authentication, getMessages);

module.exports = router;