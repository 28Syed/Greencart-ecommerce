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


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
