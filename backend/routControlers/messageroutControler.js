import Conversation from "../Models/conversationModels.js";
import Message from "../Models/messageSchema.js";
import mongoose from "mongoose";
import { getReceiverSocketId, io } from "../Socket/socket.js";

export const sendMessage = async (req, res) => {
    try {
        const { messages } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let chats = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });
        if (!chats) {
            chats = await Conversation.create({
                participants: [senderId, receiverId],
            });
        }
        const newMessages = new Message({
            senderId,
            receiverId,
            message: messages,
            conversationId: chats._id
        });
        if (newMessages) {
            chats.messages.push(newMessages._id);
            chats.updatedAt = new Date();
        }

        await Promise.all([chats.save(), newMessages.save()]);

        // Emit to receiver
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessages);
        }

        // Emit to sender (so sender's sidebar immediately moves this chatter to the top)
        const senderSocketId = getReceiverSocketId(senderId.toString());
        if (senderSocketId) {
            io.to(senderSocketId).emit("newMessage", newMessages);
        }

        res.status(201).send(newMessages);
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error
        });
        console.log(error);
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        const chats = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        }).populate("messages");

        if (!chats) return res.status(200).send([]);

        // Mark all messages sent by the other user as seen in MongoDB
        await Message.updateMany(
            {
                conversationId: chats._id,
                senderId: receiverId,
                receiverId: senderId,
                seen: false
            },
            { $set: { seen: true } }
        );

        const message = chats.messages;
        res.status(200).send(message);

    } catch (error) {
        res.status(500).send({
            success: false,
            message: error
        });
        console.log(error);
    }
};

export const deleteMultipleMessages = async (req, res) => {
    try {
        const { messageIds, conversationId } = req.body;

        if (!messageIds || messageIds.length === 0) {
            return res.status(400).json({ error: "No messages selected" });
        }

        await Message.deleteMany({ _id: { $in: messageIds } });

        await Conversation.findByIdAndUpdate(conversationId, {
            $pull: { messages: { $in: messageIds } }
        });

        res.status(200).json({ message: "Messages deleted successfully" });
    } catch (error) {
        console.log("Error in deleteMultipleMessages:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};