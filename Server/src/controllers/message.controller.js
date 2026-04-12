import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ],
            deletedFor: { $ne: myId }
        });

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, image, isCallRequest } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            // Upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
            isCallRequest: isCallRequest || false
        });

        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const editMessage = async (req, res) => {
    try {
        const { text } = req.body;
        const { id: messageId } = req.params;
        const senderId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ error: "Message not found" });

        if (message.senderId.toString() !== senderId.toString()) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (message.isSeen) {
            return res.status(400).json({ error: "Cannot edit an already seen message" });
        }

        message.text = text;
        message.isEdited = true;
        await message.save();

        const receiverSocketId = getReceiverSocketId(message.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageEdited", message);
        }

        res.status(200).json(message);
    } catch (error) {
        console.log("Error in editMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const markMessagesAsSeen = async (req, res) => {
    try {
        const { id: senderId } = req.params;
        const myId = req.user._id;

        await Message.updateMany(
            { senderId, receiverId: myId, isSeen: false },
            { $set: { isSeen: true } }
        );

        const senderSocketId = getReceiverSocketId(senderId);
        if (senderSocketId) {
            io.to(senderSocketId).emit("messagesSeen", { receiverId: myId });
        }

        res.status(200).json({ message: "Messages marked as seen" });
    } catch (error) {
        console.log("Error in markMessagesAsSeen: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteMessageForMe = async (req, res) => {
    try {
        const { id: messageId } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ error: "Message not found" });

        if (!message.deletedFor.includes(userId)) {
            message.deletedFor.push(userId);
            await message.save();
        }

        res.status(200).json({ message: "Deleted for me" });
    } catch (error) {
        console.log("Error in deleteMessageForMe: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteMessageForEveryone = async (req, res) => {
    try {
        const { id: messageId } = req.params;
        const senderId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ error: "Message not found" });

        if (message.senderId.toString() !== senderId.toString()) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const msgDate = new Date(message.createdAt);
        const now = new Date();
        const diffInHours = (now - msgDate) / (1000 * 60 * 60);

        if (diffInHours > 24) {
            return res.status(400).json({ error: "Can only delete messages within 24 hours" });
        }

        message.isDeletedForEveryone = true;
        message.text = "This message was deleted";
        message.image = null;
        message.isCallRequest = false;
        await message.save();

        const receiverSocketId = getReceiverSocketId(message.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageDeletedForEveryone", message);
        }

        res.status(200).json(message);
    } catch (error) {
        console.log("Error in deleteMessageForEveryone: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

