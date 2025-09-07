import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.ObjectId, 
        ref: 'user', 
        required: true 
    },
    sessionId: { 
        type: String, 
        required: true 
    },
    messages: [{
        role: { 
            type: String, 
            enum: ['user', 'assistant', 'system'], 
            required: true 
        },
        content: { 
            type: String, 
            required: true 
        },
        timestamp: { 
            type: Date, 
            default: Date.now 
        },
        metadata: {
            orderId: String,
            productId: String,
            action: String
        }
    }],
    isActive: { 
        type: Boolean, 
        default: true 
    },
    lastActivity: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

export default mongoose.models.chat || mongoose.model("chat", chatSchema);
