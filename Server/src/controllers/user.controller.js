import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";

export const updateProfile = async (req, res) => {
    const { profilePic, bio, fullName, phoneNumber } = req.body;
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);

        if (profilePic) {
            // Upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(profilePic);
            user.profilePic = uploadResponse.secure_url;
        }

        if (bio) user.bio = bio;
        if (fullName) user.fullName = fullName;
        if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;

        const updatedUser = await user.save();

        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("error in update profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
