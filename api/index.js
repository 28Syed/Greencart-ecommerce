const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

// CORS - Allow frontend to call backend
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Test route
app.get('/', (req, res) => {
    res.json({ message: "API is Working" });
});

// Products API - This is what your frontend needs
app.get('/api/products', (req, res) => {
    res.json([
        {
            _id: "1",
            name: "Fresh Apples",
            price: 299,
            image: "/src/assets/apple_image.png",
            category: "fruits",
            inStock: true
        },
        {
            _id: "2",
            name: "Organic Bananas",
            price: 199,
            image: "/src/assets/banana_image_1.png",
            category: "fruits",
            inStock: true
        },
        {
            _id: "3",
            name: "Fresh Carrots",
            price: 149,
            image: "/src/assets/carrot_image.png",
            category: "vegetables",
            inStock: true
        }
    ]);
});

// User API - For login functionality
app.post('/api/user/login', (req, res) => {
    res.json({ 
        success: true, 
        message: "Login successful",
        token: "mock-token-123",
        user: { name: "Test User", email: "test@example.com" }
    });
});

app.get('/api/user/profile', (req, res) => {
    res.json({ 
        success: true,
        user: { name: "Test User", email: "test@example.com" }
    });
});

// Seller API - For seller authentication
app.get('/api/seller/is-auth', (req, res) => {
    res.json({ 
        success: true,
        message: "Seller authenticated"
    });
});

// Cart API - For cart functionality
app.get('/api/cart', (req, res) => {
    res.json({ 
        success: true,
        cartItems: []
    });
});

app.post('/api/cart/add', (req, res) => {
    res.json({ 
        success: true,
        message: "Item added to cart"
    });
});

// Chat routes
app.post('/api/chat/session', (req, res) => {
    try {
        const { sessionId } = req.body;
        const newSessionId = sessionId || "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
        
        const welcomeMessage = {
            role: 'assistant',
            content: 'Hello! I\'m your GreenCart assistant. How can I help you today? I can help you with orders, products, account issues, or any other questions you might have.',
            timestamp: new Date()
        };

        res.json({
            success: true,
            sessionId: newSessionId,
            messages: [welcomeMessage]
        });

    } catch (error) {
        console.error('[Chat Session] Error:', error);
        res.status(500).json({ success: false, message: 'Failed to create chat session' });
    }
});

app.post('/api/chat/message', (req, res) => {
    try {
        const { message, sessionId } = req.body;

        if (!message || !sessionId) {
            return res.status(400).json({ success: false, message: 'Message and sessionId are required' });
        }

        // Simple AI responses without OpenAI for now
        let aiResponse = "I'm here to help! How can I assist you today?";
        
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
        } else {
            aiResponse = "I'm here to help! How can I assist you with your GreenCart shopping today?";
        }

        res.json({
            success: true,
            message: aiResponse,
            sessionId: sessionId
        });

    } catch (error) {
        console.error('[Chat Message] Error:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
