import mongoose from 'mongoose';

const statusSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    caption: {
        type: String,
        default: "",
    },
    viewers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(+new Date() + 24 * 60 * 60 * 1000) // 24 hours from now
    }
}, { timestamps: true });

// Index for automatic deletion of expired statuses (TTL index)
statusSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Status = mongoose.model('Status', statusSchema);

export default Status;
