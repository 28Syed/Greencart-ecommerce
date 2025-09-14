import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());

// CORS configuration
app.use(cors({
    origin: ['https://playful-tarsier-42b431.netlify.app', 'http://localhost:3000', 'http://localhost:5173'],
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

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
    res.json({ success: true, message: "Logged out successfully" });
});

// Product routes
app.get('/api/product/list', (req, res) => {
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

// Cart routes
app.get('/api/cart', (req, res) => {
    res.json({ success: true, cartItems: [] });
});

app.post('/api/cart/add', (req, res) => {
    res.json({ success: true, message: "Item added to cart" });
});

app.post('/api/cart/update', (req, res) => {
    res.json({ 
        success: true, 
        message: "Cart updated",
        cartItems: req.body.cartItems || {}
    });
});

// Order routes
app.get('/api/order/user', (req, res) => {
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
                            image: ["/src/assets/apple_image.png"],
                            category: "fruits"
                        },
                        quantity: 2
                    }
                ],
                amount: 598,
                paymentType: "COD",
                status: "Delivered",
                createdAt: new Date().toISOString()
            }
        ]
    });
});

app.post('/api/order/cod', (req, res) => {
    res.json({ success: true, message: "Order placed successfully" });
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

app.post('/api/address/add', (req, res) => {
    res.json({ success: true, message: "Address added successfully" });
});

// Wishlist routes
app.get('/api/wishlist', (req, res) => {
    res.json({ 
        success: true, 
        wishlist: { 
            products: [
                {
                    _id: "1",
                    name: "Fresh Apples",
                    price: 299,
                    image: ["/src/assets/apple_image.png"],
                    category: "fruits",
                    inStock: true
                }
            ]
        }
    });
});

app.post('/api/wishlist/add/:productId', (req, res) => {
    res.json({ success: true, message: "Added to wishlist" });
});

app.delete('/api/wishlist/remove/:productId', (req, res) => {
    res.json({ success: true, message: "Removed from wishlist" });
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

app.post('/api/review/add/:productId', (req, res) => {
    res.json({ success: true, message: "Review added successfully" });
});

// Seller routes
app.post('/api/seller/login', (req, res) => {
    res.json({ success: true, message: "Seller logged in successfully" });
});

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

app.get('/api/seller/logout', (req, res) => {
    res.json({ success: true, message: "Seller logged out successfully" });
});

app.post('/api/product/add', (req, res) => {
    res.json({ success: true, message: "Product added successfully" });
});

app.post('/api/product/stock', (req, res) => {
    res.json({ success: true, message: "Stock updated" });
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
                            image: ["/src/assets/apple_image.png"],
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

// Razorpay routes
app.post('/api/razorpay/order', (req, res) => {
    res.json({ 
        success: true, 
        order: { 
            id: "order_123", 
            amount: 1000, 
            currency: "INR" 
        } 
    });
});

app.post('/api/razorpay/verify', (req, res) => {
    res.json({ success: true, message: "Payment verified successfully" });
});

// Chat routes
app.get('/api/chat/session', (req, res) => {
    res.json({ success: true, sessionId: "session_123" });
});

app.post('/api/chat/message', (req, res) => {
    res.json({ success: true, message: "Message sent successfully" });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});



