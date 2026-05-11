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
        }


        await Promise.all([chats.save(), newMessages.save()]);

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessages)
        }

        res.status(201).send(newMessages);
    } catch (error) {
        res.status(500).send(
            {
                success: false,
                message: error
            }
        )
        console.log(error);
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        const chats = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        }).populate("messages")

        if (!chats) return res.status(200).send([]);
        const message = chats.messages;
        res.status(200).send(message)

    } catch (error) {
        res.status(500).send(
            {
                success: false,
                message: error
            }
        )
        console.log(error);
    }

}


export const deleteMultipleMessages = async (req, res) => {
    try {
        const { messageIds, conversationId } = req.body; // messageIds is an array [id1, id2...]

        if (!messageIds || messageIds.length === 0) {
            return res.status(400).json({ error: "No messages selected" });
        }

        // 1. Delete all selected messages from the Message collection
        await Message.deleteMany({ _id: { $in: messageIds } });

        // 2. Remove all those IDs from the Conversation's messages array
        await Conversation.findByIdAndUpdate(conversationId, {
            $pull: { messages: { $in: messageIds } }
        });

        res.status(200).json({ message: "Messages deleted successfully" });
    } catch (error) {
        console.log("Error in deleteMultipleMessages:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};