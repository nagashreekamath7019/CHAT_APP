import mongoose from "mongoose";
import User from "../Models/userModels.js";
import Conversation from "../Models/conversationModels.js";

export const getUserBySearch = async (req, res) => {
    try {
        const search = req.query.search || '';
        const rawUserId = req.user?._id || req.user;

        if (!rawUserId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const currentUserID = new mongoose.Types.ObjectId(rawUserId.toString());

        const users = await User.find({
            $and: [
                {
                    $or: [
                        { username: { $regex: search, $options: "i" } },
                        { fullname: { $regex: search, $options: "i" } }
                    ]
                },
                {
                    _id: { $ne: currentUserID }
                }
            ]
        }).select("-password");

        return res.status(200).json(users);

    } catch (error) {
        console.error("Error in getUserBySearch:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

export const getCurrentChatters = async (req, res) => {
    try {
        const rawUserId = req.user?._id || req.user;

        if (!rawUserId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const currentUserID = new mongoose.Types.ObjectId(rawUserId.toString());

        // 1. Find all conversations where current user is a participant
        // Sort by updatedAt descending (latest activity at the top)
        const conversations = await Conversation.find({
            participants: { $in: [currentUserID] }
        })
        .populate("messages")
        .sort({ updatedAt: -1 });

        if (!conversations || conversations.length === 0) {
            return res.status(200).json([]);
        }

        // 2. Extract other participants preserving latest conversation order
        const orderedParticipantIds = [];
        const unreadCountMap = {};

        for (const conv of conversations) {
            const otherParticipantId = conv.participants.find(
                (p) => p && p.toString() !== currentUserID.toString()
            );

            if (otherParticipantId) {
                const idStr = otherParticipantId.toString();

                if (!orderedParticipantIds.includes(idStr)) {
                    orderedParticipantIds.push(idStr);

                    // Safely compute unread messages sent by the other chatter
                    const unread = (conv.messages || []).filter((msg) => {
                        if (!msg || !msg.senderId) return false;
                        const isFromOther = msg.senderId.toString() === idStr;
                        const isUnseen = msg.seen === false || (msg.seen === undefined && !conv.seenBy?.includes(currentUserID));
                        return isFromOther && isUnseen;
                    }).length;

                    unreadCountMap[idStr] = unread;
                }
            }
        }

        if (orderedParticipantIds.length === 0) {
            return res.status(200).json([]);
        }

        // 3. Fetch all user records in one query
        const objectIdsToFetch = orderedParticipantIds.map((id) => new mongoose.Types.ObjectId(id));
        const users = await User.find({
            _id: { $in: objectIdsToFetch }
        }).select("-password");

        // 4. Return users strictly preserving the conversation recency order
        const orderedUsers = orderedParticipantIds
            .map((id) => {
                const foundUser = users.find((u) => u._id.toString() === id);
                if (!foundUser) return null;

                const userObj = foundUser.toObject();
                userObj.unreadCount = unreadCountMap[id] || 0;
                return userObj;
            })
            .filter(Boolean);

        return res.status(200).json(orderedUsers);

    } catch (error) {
        console.error("Error in getCurrentChatters:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error("Error in getUserProfile controller:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};