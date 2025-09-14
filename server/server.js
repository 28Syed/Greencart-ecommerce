import express from 'express';
import cors from 'cors';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import crypto from 'crypto';
import mongoose from 'mongoose';
import OpenAI from 'openai';

dotenv.config();

const app = express();

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_RH7Vojm8llKsRb',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'U839sMZljuqAfnOmMUz7eVZg'
});

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'sk-proj-1234567890'
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/greencart', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Database Models
const User = mongoose.model('user', new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    cartItems: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'product' }, quantity: Number }]
}, { timestamps: true }));

const Order = mongoose.model('order', new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'product' }, quantity: Number }],
    amount: Number,
    status: String,
    paymentMethod: String,
    addressId: String
}, { timestamps: true }));

const Chat = mongoose.model('chat', new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    sessionId: { type: String, required: true },
    messages: [{
        role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }],
    isActive: { type: Boolean, default: true },
    lastActivity: { type: Date, default: Date.now }
}, { timestamps: true }));

const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());

// CORS configuration
app.use(cors({
    origin: [
        'https://playful-tarsier-42b431.netlify.app', 
        'https://greencart-frontend-kt3gul3hx-syed-ikrams-projects.vercel.app',
        'https://greencart-frontend-5x99a0y5t-syed-ikrams-projects.vercel.app',
        'https://greencart-frontend-8qleaimh3-syed-ikrams-projects.vercel.app',
        'https://greencart-frontend-qj57wbtxd-syed-ikrams-projects.vercel.app',
        'http://localhost:3000', 
        'http://localhost:5173'
    ],
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Authentication middleware
const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: "Access denied. No token provided."
        });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // For demo purposes, accept any token (in real app, verify JWT)
    if (!token || token.length < 10) {
        return res.status(401).json({
            success: false,
            message: "Invalid token."
        });
    }
    
    // In a real app, you would verify the JWT token here
    // For now, we'll just check if a token exists
    req.user = { id: "demo_user", name: "Demo User" }; // Mock user
    next();
};

// Test route
app.get('/', (req, res) => {
    res.json({ message: "API is Working" });
});

// User routes
app.post('/api/user/register', (req, res) => {
    res.json({ success: true, message: "User registered successfully" });
});

app.post('/api/user/login', (req, res) => {
    res.json({ 
        success: true, 
        message: "Login successful",
        token: "mock-token-123",
        user: { name: "Test User", email: "test@example.com" }
    });
});

app.get('/api/user/is-auth', (req, res) => {
    res.json({
        success: true,
        message: "User authenticated",
        user: {
            _id: "user123",
            name: "Test User",
            email: "test@example.com",
            cartItems: []
        }
    });
});

app.get('/api/user/logout', (req, res) => {
    res.json({
        success: true,
        message: "Logged out successfully"
    });
});

// Complete product list - shared between product endpoint and getProductById function
const completeProductList = [
        // Vegetables
        {
            _id: "gd46g23h",
            name: "Potato 500g",
            category: "Vegetables",
            price: 25,
            offerPrice: 20,
            image: ["/assets/potato_image_1-Dunc3diJ.png", "/assets/potato_image_2-NrNj7MY8.png", "/assets/potato_image_3-v9M48Pyt.png", "/assets/potato_image_4-5VP_afI2.png"],
            description: [
                "Fresh and organic",
                "Rich in carbohydrates",
                "Ideal for curries and fries",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },
        {
            _id: "gd47g34h",
            name: "Tomato 1 kg",
            category: "Vegetables",
            price: 40,
            offerPrice: 35,
            image: ["/assets/tomato_image-DTyvfqsS.png"],
            description: [
                "Juicy and ripe",
                "Rich in Vitamin C",
                "Perfect for salads and sauces",
                "Farm fresh quality",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },
        {
            _id: "gd48g45h",
            name: "Carrot 500g",
            category: "Vegetables",
            price: 30,
            offerPrice: 28,
            image: ["/assets/carrot_image-GkwsIFHl.png"],
            description: [
                "Sweet and crunchy",
                "Good for eyesight",
                "Ideal for juices and salads",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },
        {
            _id: "gd49g56h",
            name: "Spinach 500g",
            category: "Vegetables",
            price: 18,
            offerPrice: 15,
            image: ["/assets/spinach_image_1-BFTvDCDF.png"],
            description: [
                "Rich in iron",
                "High in vitamins",
                "Perfect for soups and salads",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },
        {
            _id: "gd50g67h",
            name: "Onion 500g",
            category: "Vegetables",
            price: 22,
            offerPrice: 19,
            image: ["/assets/onion_image_1-GN6dACW5.png"],
            description: [
                "Fresh and pungent",
                "Perfect for cooking",
                "A kitchen staple",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },

        // Fruits
        {
            _id: "ek51j12k",
            name: "Apple 1 kg",
            category: "Fruits",
            price: 120,
            offerPrice: 110,
            image: ["/assets/apple_image-BOKTWnM8.png"],
            description: [
                "Crisp and juicy",
                "Rich in fiber",
                "Boosts immunity",
                "Perfect for snacking and desserts",
                "Organic and farm fresh",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },
        {
            _id: "ek52j23k",
            name: "Orange 1 kg",
            category: "Fruits",
            price: 80,
            offerPrice: 75,
            image: ["/assets/orange_image-DfoqYLig.png"],
            description: [
                "Juicy and sweet",
                "Rich in Vitamin C",
                "Perfect for juices and salads",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },
        {
            _id: "ek53j34k",
            name: "Banana 1 kg",
            category: "Fruits",
            price: 50,
            offerPrice: 45,
            image: ["/assets/banana_image_1-CqUXbIlz.png"],
            description: [
                "Sweet and ripe",
                "High in potassium",
                "Great for smoothies and snacking",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },
        {
            _id: "ek54j45k",
            name: "Mango 1 kg",
            category: "Fruits",
            price: 150,
            offerPrice: 140,
            image: ["/assets/mango_image_1-BQM7kW4l.png"],
            description: [
                "Sweet and flavorful",
                "Perfect for smoothies and desserts",
                "Rich in Vitamin A",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },
        {
            _id: "ek55j56k",
            name: "Grapes 500g",
            category: "Fruits",
            price: 70,
            offerPrice: 65,
            image: ["/assets/grapes_image_1-D2qP9V_J.png"],
            description: [
                "Fresh and juicy",
                "Rich in antioxidants",
                "Perfect for snacking and fruit salads",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },

        // Dairy
        {
            _id: "ek56j67k",
            name: "Amul Milk 1L",
            category: "Dairy",
            price: 60,
            offerPrice: 55,
            image: ["/assets/amul_milk_image-BN77drpI.png"],
            description: [
                "Pure and fresh",
                "Rich in calcium",
                "Ideal for tea, coffee, and desserts",
                "Trusted brand quality",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },
        {
            _id: "ek57j78k",
            name: "Paneer 200g",
            category: "Dairy",
            price: 90,
            offerPrice: 85,
            image: ["/assets/paneer_image-DGuXuMzW.png"],
            description: [
                "Soft and fresh",
                "Rich in protein",
                "Ideal for curries and snacks",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },
        {
            _id: "ek58j89k",
            name: "Eggs 12 pcs",
            category: "Dairy",
            price: 90,
            offerPrice: 85,
            image: ["/assets/eggs_image-DhkspuYm.png"],
            description: [
                "Farm fresh",
                "Rich in protein",
                "Ideal for breakfast and baking",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },
        {
            _id: "ek59j90k",
            name: "Paneer 200g",
            category: "Dairy",
            price: 90,
            offerPrice: 85,
            image: ["/assets/paneer_image_2-BpCbwr8-.png"],
            description: [
                "Soft and fresh",
                "Rich in protein",
                "Ideal for curries and snacks",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },
        {
            _id: "ek60j01k",
            name: "Cheese 200g",
            category: "Dairy",
            price: 140,
            offerPrice: 130,
            image: ["/assets/cheese_image-Dbia_8kh.png"],
            description: [
                "Creamy and delicious",
                "Perfect for pizzas and sandwiches",
                "Rich in calcium",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },

        // Drinks
        {
            _id: "ek61j12k",
            name: "Coca-Cola 1.5L",
            category: "Drinks",
            price: 80,
            offerPrice: 75,
            image: ["/assets/coca_cola_image-2N9qnj0q.png"],
            description: [
                "Refreshing and fizzy",
                "Perfect for parties and gatherings",
                "Best served chilled",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },
        {
            _id: "ek62j23k",
            name: "Pepsi 1.5L",
            category: "Drinks",
            price: 78,
            offerPrice: 73,
            image: ["/assets/pepsi_image-DfLDubHS.png"],
            description: [
                "Chilled and refreshing",
                "Perfect for celebrations",
                "Best served cold",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },
        {
            _id: "ek63j34k",
            name: "Sprite 1.5L",
            category: "Drinks",
            price: 79,
            offerPrice: 74,
            image: ["/assets/sprite_image_1-BX1jiHYF.png"],
            description: [
                "Refreshing citrus taste",
                "Perfect for hot days",
                "Best served chilled",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },
        {
            _id: "ek64j45k",
            name: "Fanta 1.5L",
            category: "Drinks",
            price: 77,
            offerPrice: 72,
            image: ["/assets/fanta_image_1-CmWc6OFO.png"],
            description: [
                "Sweet and fizzy",
                "Great for parties and gatherings",
                "Best served cold",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },
        {
            _id: "ek65j56k",
            name: "7 Up 1.5L",
            category: "Drinks",
            price: 76,
            offerPrice: 71,
            image: ["/assets/seven_up_image_1-CoYFONJ_.png"],
            description: [
                "Refreshing lemon-lime flavor",
                "Perfect for refreshing",
                "Best served chilled",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },

        // Grains
        {
            _id: "ek66j67k",
            name: "Basmati Rice 5kg",
            category: "Grains",
            price: 550,
            offerPrice: 520,
            image: ["/assets/basmati_rice_image-ArdSOXu_.png"],
            description: [
                "Long grain and aromatic",
                "Perfect for biryani and pulao",
                "Premium quality",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },
        {
            _id: "ek67j78k",
            name: "Wheat Flour 5kg",
            category: "Grains",
            price: 250,
            offerPrice: 230,
            image: ["/assets/wheat_flour_image-Bc-YwWg1.png"],
            description: [
                "High-quality whole wheat",
                "Soft and fluffy rotis",
                "Rich in nutrients",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },
        {
            _id: "ek68j89k",
            name: "Organic Quinoa 500g",
            category: "Grains",
            price: 450,
            offerPrice: 420,
            image: ["/assets/quinoa_image-CoUQXhH4.png"],
            description: [
                "High in protein and fiber",
                "Gluten-free",
                "Rich in vitamins and minerals",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },
        {
            _id: "ek69j90k",
            name: "Brown Rice 1kg",
            category: "Grains",
            price: 120,
            offerPrice: 110,
            image: ["/assets/brown_rice_image-CQimXrOA.png"],
            description: [
                "Whole grain and nutritious",
                "Helps in weight management",
                "Good source of magnesium",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },
        {
            _id: "ek70j01k",
            name: "Barley 1kg",
            category: "Grains",
            price: 150,
            offerPrice: 140,
            image: ["/assets/barley_image-BWx2eT4d.png"],
            description: [
                "Rich in fiber",
                "Helps improve digestion",
                "Low in fat and cholesterol",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },

        // Bakery
        {
            _id: "bk01a24z",
            name: "Brown Bread 400g",
            category: "Bakery",
            price: 40,
            offerPrice: 35,
            image: ["/assets/brown_bread_image-D908RMy_.png"],
            description: [
                "Soft and healthy",
                "Made from whole wheat",
                "Ideal for breakfast and sandwiches",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },
        {
            _id: "bk02b30y",
            name: "Butter Croissant 100g",
            category: "Bakery",
            price: 50,
            offerPrice: 45,
            image: ["/assets/butter_croissant_image-CMp4mLHU.png"],
            description: [
                "Flaky and buttery",
                "Freshly baked",
                "Perfect for breakfast or snacks",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },
        {
            _id: "bk03c31x",
            name: "Chocolate Cake 500g",
            category: "Bakery",
            price: 350,
            offerPrice: 325,
            image: ["/assets/chocolate_cake_image-grvCJisa.png"],
            description: [
                "Rich and moist",
                "Made with premium cocoa",
                "Ideal for celebrations and parties",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },
        {
            _id: "bk04d32w",
            name: "Whole Bread 400g",
            category: "Bakery",
            price: 45,
            offerPrice: 40,
            image: ["/assets/whole_wheat_bread_image-DpTTwi5t.png"],
            description: [
                "Healthy and nutritious",
                "Made with whole wheat flour",
                "Ideal for sandwiches and toast",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },
        {
            _id: "bk05e33v",
            name: "Vanilla Muffins 6 pcs",
            category: "Bakery",
            price: 100,
            offerPrice: 90,
            image: ["/assets/vanilla_muffins_image-CRgrOTxJ.png"],
            description: [
                "Soft and fluffy",
                "Perfect for a quick snack",
                "Made with real vanilla",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },

        // Instant
        {
            _id: "in01f25u",
            name: "Maggi Noodles 280g",
            category: "Instant",
            price: 55,
            offerPrice: 50,
            image: ["/assets/maggi_image-DD7JXh5a.png"],
            description: [
                "Instant and easy to cook",
                "Delicious taste",
                "Popular among kids and adults",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },
        {
            _id: "in02g26t",
            name: "Top Ramen 270g",
            category: "Instant",
            price: 45,
            offerPrice: 40,
            image: ["/assets/top_ramen_image-DBcbphk7.png"],
            description: [
                "Quick and easy to prepare",
                "Spicy and flavorful",
                "Loved by college students and families",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },
        {
            _id: "in03h27s",
            name: "Knorr Cup Soup 70g",
            category: "Instant",
            price: 35,
            offerPrice: 30,
            image: ["/assets/knorr_soup_image-8VigJvZo.png"],
            description: [
                "Convenient for on-the-go",
                "Healthy and nutritious",
                "Variety of flavors",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },
        {
            _id: "in04i28r",
            name: "Yippee Noodles 260g",
            category: "Instant",
            price: 50,
            offerPrice: 45,
            image: ["/assets/yippee_image-Chd9IoCI.png"],
            description: [
                "Non-fried noodles for healthier choice",
                "Tasty and filling",
                "Convenient for busy schedules",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        },
        {
            _id: "in05j29q",
            name: "Oats Noodles 72g",
            category: "Instant",
            price: 40,
            offerPrice: 35,
            image: ["/assets/maggi_oats_image-BROzZc4u.png"],
            description: [
                "Healthy alternative with oats",
                "Good for digestion",
                "Perfect for breakfast or snacks",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        }
    ];

// Product routes
app.get('/api/product/list', (req, res) => {
    res.json(completeProductList);
});

// Cart routes
app.post('/api/cart/update', (req, res) => {
    res.json({
        success: true,
        message: "Cart updated",
        cartItems: req.body.cartItems || {}
    });
});

// Address routes
app.get('/api/address/get', (req, res) => {
    res.json({
        success: true,
        addresses: [
            {
                _id: "addr1",
                firstName: "John",
                lastName: "Doe",
                street: "123 Main St",
                city: "New York",
                state: "NY",
                zipcode: "10001",
                country: "USA",
                phone: "123-456-7890"
            }
        ]
    });
});

// In-memory wishlist storage (in production, this would be in a database)
const wishlists = {};

// In-memory order storage (in production, this would be in a database)
const orders = {};

// Store pending orders with cart data
const pendingOrders = {};

// Helper function to get product by ID
const getProductById = (productId) => {
    // Use the complete product list instead of hardcoded subset
    return completeProductList.find(p => p._id === productId) || {
        _id: productId,
        name: `Product ${productId}`,
        category: "General",
        price: 100,
        offerPrice: 90,
        image: ["/assets/apple_image-BOKTWnM8.png"],
        inStock: true,
    };
};

// Wishlist routes
app.get('/api/wishlist', (req, res) => {
    const userId = req.headers.authorization ? "demo_user" : "guest";
    const userWishlist = wishlists[userId] || [];
    
    res.json({
        success: true,
        wishlist: {
            products: userWishlist
        }
    });
});

// Add to wishlist
app.post('/api/wishlist/add/:productId', authenticateUser, (req, res) => {
    const { productId } = req.params;
    const userId = req.user.id;
    
    // Initialize wishlist for user if it doesn't exist
    if (!wishlists[userId]) {
        wishlists[userId] = [];
    }
    
    // Check if product is already in wishlist
    const existingIndex = wishlists[userId].findIndex(p => p._id === productId);
    if (existingIndex === -1) {
        // Get the actual product data
        const product = getProductById(productId);
        wishlists[userId].push(product);
    }
    
    res.json({
        success: true,
        message: "Product added to wishlist successfully",
        userId: userId
    });
});

// Remove from wishlist
app.delete('/api/wishlist/remove/:productId', authenticateUser, (req, res) => {
    const { productId } = req.params;
    const userId = req.user.id;
    
    // Initialize wishlist for user if it doesn't exist
    if (!wishlists[userId]) {
        wishlists[userId] = [];
    }
    
    // Remove product from wishlist
    const existingIndex = wishlists[userId].findIndex(p => p._id === productId);
    if (existingIndex !== -1) {
        wishlists[userId].splice(existingIndex, 1);
    }
    
    res.json({
        success: true,
        message: "Product removed from wishlist successfully",
        userId: userId
    });
});

// Review routes
app.get('/api/review/:productId', (req, res) => {
    res.json({
        success: true,
        reviews: [
            {
                _id: "rev1",
                rating: 5,
                comment: "Great product!",
                user: { name: "John Doe" },
                createdAt: new Date().toISOString()
            }
        ]
    });
});

// Order routes
app.get('/api/order/user', (req, res) => {
    const userId = req.headers.authorization ? "demo_user" : "guest";
    const userOrders = orders[userId] || [];
    
    res.json({ 
        success: true,
        orders: userOrders
    });
});

// Seller routes
app.get('/api/seller/is-auth', (req, res) => {
    res.json({ 
        success: true,
        message: "Seller authenticated",
        seller: {
            _id: "seller123",
            name: "Test Seller",
            email: "seller@example.com"
        }
    });
});

app.get('/api/order/seller', (req, res) => {
    res.json({
        success: true,
        orders: [
            {
                _id: "order1",
                items: [
                    {
                        product: {
                            _id: "1",
                            name: "Fresh Apples",
                            image: ["/assets/apple_image-BOKTWnM8.png"],
                            category: "fruits"
                        },
                        quantity: 2
                    }
                ],
                amount: 598,
                paymentType: "COD",
                status: "Delivered",
                isPaid: true,
                address: {
                    firstName: "John",
                    lastName: "Doe",
                    street: "123 Main St",
                    city: "New York",
                    state: "NY",
                    zipcode: "10001",
                    country: "USA",
                    phone: "123-456-7890"
                },
                createdAt: new Date().toISOString()
            }
        ]
    });
});


// COD Order endpoint
app.post('/api/order/cod', authenticateUser, (req, res) => {
    const { items, address, amount } = req.body;
    const userId = req.user.id;
    const orderId = "order_" + Date.now();
    
    // Initialize orders for user if it doesn't exist
    if (!orders[userId]) {
        orders[userId] = [];
    }
    
    // Create order with actual products
    const orderItems = items.map(item => ({
        product: getProductById(item.product),
        quantity: item.quantity
    }));
    
    const newOrder = {
        _id: orderId,
        items: orderItems,
        amount: amount,
        paymentType: "COD",
        status: "Placed",
        isPaid: false,
        address: address,
        createdAt: new Date().toISOString()
    };
    
    orders[userId].push(newOrder);
    
    res.json({
        success: true,
        message: "Order placed successfully with Cash on Delivery",
        orderId: orderId,
        userId: userId
    });
});

// Razorpay Order Creation
app.post('/api/razorpay/order', authenticateUser, async (req, res) => {
    try {
        const { amount, addressId, items } = req.body;
        
        console.log("Razorpay order creation request:", { amount, addressId, items });
        
        // Create real Razorpay order
        const orderOptions = {
            amount: Math.round(amount * 100), // Convert to paise
            currency: "INR",
            receipt: "receipt_" + Date.now(),
            notes: {
                userId: req.user.id,
                addressId: addressId,
                itemCount: items.length
            }
        };
        
        console.log("Creating real Razorpay order:", orderOptions);
        
        const order = await razorpay.orders.create(orderOptions);
        
        console.log("Razorpay order created successfully:", order);
        
        // Store the cart data for this order
        pendingOrders[order.id] = {
            items: items,
            amount: amount,
            addressId: addressId,
            userId: req.user.id
        };
        
        res.json({
            success: true,
            order: order,
            userId: req.user.id
        });
    } catch (error) {
        console.error("Razorpay order creation error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create payment order",
            error: error.message
        });
    }
});

// Razorpay Payment Verification
app.post('/api/razorpay/verify', authenticateUser, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
        
        console.log("Payment verification request:", { razorpay_order_id, razorpay_payment_id, orderId });
        
        // Verify Razorpay signature
        const crypto = require('crypto');
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "U839sMZljuqAfnOmMUz7eVZg")
            .update(body.toString())
            .digest("hex");
        
        const isAuthentic = expectedSignature === razorpay_signature;
        
        if (isAuthentic && razorpay_order_id && razorpay_payment_id) {
            // Store the order in memory (in production, this would be in database)
            const userId = req.user.id;
            if (!orders[userId]) {
                orders[userId] = [];
            }
            
            // Get the stored cart data for this order
            const pendingOrder = pendingOrders[orderId];
            
            if (pendingOrder) {
                // Create order with ACTUAL products from the stored cart data
                const actualOrder = {
                    _id: orderId,
                    items: pendingOrder.items.map(item => ({
                        product: getProductById(item.product),
                        quantity: item.quantity
                    })),
                    amount: pendingOrder.amount,
                    paymentType: "Online",
                    status: "Paid",
                    isPaid: true,
                    address: {
                        firstName: "User",
                        lastName: "Name",
                        street: "Sample Address",
                        city: "Sample City",
                        state: "Sample State",
                        zipcode: "12345",
                        country: "India",
                        phone: "1234567890"
                    },
                    createdAt: new Date().toISOString()
                };
                
                orders[userId].push(actualOrder);
                
                // Clean up pending order
                delete pendingOrders[orderId];
            } else {
                // Fallback if no pending order found
                const fallbackOrder = {
                    _id: orderId,
                    items: [
                        {
                            product: getProductById("ek54j45k"), // Mango
                            quantity: 1
                        }
                    ],
                    amount: 140,
                    paymentType: "Online",
                    status: "Paid",
                    isPaid: true,
                    address: {
                        firstName: "User",
                        lastName: "Name",
                        street: "Sample Address",
                        city: "Sample City",
                        state: "Sample State",
                        zipcode: "12345",
                        country: "India",
                        phone: "1234567890"
                    },
                    createdAt: new Date().toISOString()
                };
                
                orders[userId].push(fallbackOrder);
            }
            
            res.json({
                success: true,
                message: "Payment verified successfully",
                orderId: orderId,
                userId: req.user.id
            });
        } else {
            res.status(400).json({
                success: false,
                message: isAuthentic ? "Payment verification failed - Missing payment details" : "Payment verification failed - Invalid signature"
            });
        }
    } catch (error) {
        console.error("Payment verification error:", error);
        res.status(500).json({
            success: false,
            message: "Payment verification failed",
            error: error.message
        });
    }
});

// Chat routes
app.post('/api/chat/session', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const { sessionId } = req.body;

        // For now, use in-memory storage instead of database
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

app.post('/api/chat/message', authenticateUser, async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        const userId = req.user.id;

        if (!message || !sessionId) {
            return res.status(400).json({ success: false, message: 'Message and sessionId are required' });
        }

        // Create system prompt
        const systemPrompt = `You are a helpful AI assistant for GreenCart, an online grocery store. 
        
        You can help with:
        - Product recommendations
        - Order status and tracking
        - Account issues
        - General questions about GreenCart
        - Shopping assistance
        
        Keep responses helpful, friendly, and concise. If you don't know something specific about the user's account, ask them to check their account or contact support.`;

        // Get AI response from OpenAI with error handling
        let aiResponse = "I'm here to help! How can I assist you today?";
        
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
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
            } else {
                aiResponse = "I'm here to help! How can I assist you with your GreenCart shopping today?";
            }
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

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
