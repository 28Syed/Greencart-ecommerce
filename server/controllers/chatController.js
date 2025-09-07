import OpenAI from 'openai';
import Chat from '../models/Chat.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Generate unique session ID
const generateSessionId = () => {
    return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Get or create chat session
export const getOrCreateChatSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const { sessionId } = req.body;

        let chat;
        if (sessionId) {
            chat = await Chat.findOne({ userId, sessionId, isActive: true });
        }

        if (!chat) {
            const newSessionId = generateSessionId();
            chat = await Chat.create({
                userId,
                sessionId: newSessionId,
                messages: [{
                    role: 'assistant',
                    content: 'Hello! I\'m your GreenCart assistant. How can I help you today? I can help you with orders, products, account issues, or any other questions you might have.',
                    timestamp: new Date()
                }]
            });
        }

        res.json({
            success: true,
            sessionId: chat.sessionId,
            messages: chat.messages
        });

    } catch (error) {
        console.error('[Chat Controller - Get Session] Error:', error);
        console.error('[Chat Controller - Get Session] Error Message:', error.message);
        console.error('[Chat Controller - Get Session] Error Stack:', error.stack);
        res.status(500).json({ success: false, message: 'Error creating chat session', error: error.message });
    }
};

// Send message to AI
export const sendMessage = async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        const userId = req.user.id;

        if (!message || !sessionId) {
            return res.status(400).json({ success: false, message: 'Message and sessionId are required' });
        }

        // Get chat session
        let chat = await Chat.findOne({ userId, sessionId, isActive: true });
        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat session not found' });
        }

        // Add user message
        chat.messages.push({
            role: 'user',
            content: message,
            timestamp: new Date()
        });

        // Get user context for AI with error handling
        let user, recentOrders = [];
        try {
            user = await User.findById(userId).populate('cartItems.product');
            recentOrders = await Order.find({ userId })
                .populate('items.product')
                .sort({ createdAt: -1 })
                .limit(3);
        } catch (dbError) {
            console.error('[Database Error]', dbError.message);
            user = { name: 'User', email: 'user@example.com', cartItems: [] };
        }

        // Prepare context for AI
        const context = {
            user: {
                name: user?.name || 'User',
                email: user?.email || 'user@example.com',
                cartItems: user?.cartItems?.length || 0,
                recentOrders: recentOrders.length
            },
            recentOrders: recentOrders.map(order => ({
                id: order._id,
                amount: order.amount,
                status: order.status,
                items: order.items.length,
                date: order.createdAt
            }))
        };

        // Create system prompt with context
        const systemPrompt = `You are a helpful customer support assistant for GreenCart, an e-commerce platform. 

User Context:
- Name: ${context.user.name}
- Email: ${context.user.email}
- Cart Items: ${context.user.cartItems}
- Recent Orders: ${context.user.recentOrders}

Available Actions:
1. Order Tracking: I can help track orders and check status
2. Product Information: I can provide details about products
3. Account Help: I can assist with account-related issues
4. General Support: I can answer questions about the platform

Be helpful, friendly, and professional. If you need specific information about orders or products, ask for clarification.`;

        // Prepare messages for OpenAI
        const messages = [
            { role: 'system', content: systemPrompt },
            ...chat.messages.slice(-10) // Last 10 messages for context
        ];

        // Get AI response from OpenAI with error handling
        let aiResponse = "I'm here to help! How can I assist you today?";
        
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: messages,
                max_tokens: 300,
                temperature: 0.7,
            });

            aiResponse = completion.choices[0].message.content;
        } catch (openaiError) {
            console.error('[OpenAI Error]', openaiError.message);
            // Fallback to simple responses if OpenAI fails
            const messageLower = message.toLowerCase();
            if (messageLower.includes('hello') || messageLower.includes('hi')) {
                aiResponse = "Hello! Welcome to GreenCart. How can I help you today?";
            } else if (messageLower.includes('order')) {
                aiResponse = "I can help you with your orders. What would you like to know about your orders?";
            } else if (messageLower.includes('product')) {
                aiResponse = "We have a great selection of fresh products! What specific product are you looking for?";
            } else if (messageLower.includes('help')) {
                aiResponse = "I'm here to help! I can assist you with orders, products, account issues, or any other questions about GreenCart.";
            } else if (messageLower.includes('thank')) {
                aiResponse = "You're welcome! Is there anything else I can help you with?";
            }
        }

        // Add AI response to chat
        chat.messages.push({
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date()
        });

        // Update last activity
        chat.lastActivity = new Date();
        await chat.save();

        res.json({
            success: true,
            message: aiResponse,
            sessionId: chat.sessionId
        });

    } catch (error) {
        console.error('[Chat Controller - Send Message] Error:', error);
        console.error('[Chat Controller - Send Message] Error Message:', error.message);
        console.error('[Chat Controller - Send Message] Error Stack:', error.stack);
        res.status(500).json({ success: false, message: 'Error processing message', error: error.message });
    }
};

// Get chat history
export const getChatHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { sessionId } = req.params;

        const chat = await Chat.findOne({ userId, sessionId, isActive: true });
        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat session not found' });
        }

        res.json({
            success: true,
            messages: chat.messages
        });

    } catch (error) {
        console.error('[Chat Controller - Get History] Error:', error);
        res.status(500).json({ success: false, message: 'Error fetching chat history' });
    }
};

// End chat session
export const endChatSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const { sessionId } = req.body;

        await Chat.findOneAndUpdate(
            { userId, sessionId, isActive: true },
            { isActive: false }
        );

        res.json({
            success: true,
            message: 'Chat session ended'
        });

    } catch (error) {
        console.error('[Chat Controller - End Session] Error:', error);
        res.status(500).json({ success: false, message: 'Error ending chat session' });
    }
};
