import Status from "../models/status.model.js";
import cloudinary from "../lib/cloudinary.js";
import User from "../models/user.model.js";

// Create a new status
export const createStatus = async (req, res) => {
    try {
        const { image, caption } = req.body;
        const userId = req.user._id;

        if (!image) {
            return res.status(400).json({ message: "Image is required for a status update" });
        }

        const uploadResponse = await cloudinary.uploader.upload(image);

        const newStatus = new Status({
            userId,
            imageUrl: uploadResponse.secure_url,
            caption: caption || ""
        });

        await newStatus.save();

        res.status(201).json(newStatus);
    } catch (error) {
        console.log("Error in createStatus controller:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get all valid statuses for a user (grouped by users)
export const getStatuses = async (req, res) => {
    try {
        const currentUserId = req.user._id;

        // Find all statuses that haven't expired
        const statuses = await Status.find({
            expiresAt: { $gt: new Date() }
        }).populate("userId", "fullName profilePic").sort({ createdAt: -1 });

        // Separate user's own statuses from others
        const myStatuses = [];
        const otherStatuses = [];

        statuses.forEach(status => {
            if (status.userId._id.toString() === currentUserId.toString()) {
                myStatuses.push(status);
            } else {
                otherStatuses.push(status);
            }
        });

        res.status(200).json({ myStatuses, otherStatuses });
    } catch (error) {
        console.log("Error in getStatuses controller:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Mark a status as viewed
export const viewStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const status = await Status.findById(id);

        if (!status) {
            return res.status(404).json({ message: "Status not found" });
        }

        // Only add if not already viewed by this user, and don't add if it's their own status
        if (status.userId.toString() !== userId.toString() && !status.viewers.includes(userId)) {
            status.viewers.push(userId);
            await status.save();
        }

        res.status(200).json(status);
    } catch (error) {
        console.log("Error in viewStatus controller:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
