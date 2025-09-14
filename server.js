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

// Add new address
app.post('/api/address/add', (req, res) => {
    try {
        const { firstName, lastName, street, city, state, zipcode, country, phone } = req.body;
        
        // Generate a new address ID
        const addressId = "addr_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
        
        const newAddress = {
            _id: addressId,
            firstName,
            lastName,
            street,
            city,
            state,
            zipcode,
            country,
            phone
        };
        
        res.json({
            success: true,
            message: "Address added successfully",
            address: newAddress
        });
        
    } catch (error) {
        console.error('[Add Address] Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to add address' 
        });
    }
});

// Update address
app.put('/api/address/update/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, street, city, state, zipcode, country, phone } = req.body;
        
        const updatedAddress = {
            _id: id,
            firstName,
            lastName,
            street,
            city,
            state,
            zipcode,
            country,
            phone
        };
        
        res.json({
            success: true,
            message: "Address updated successfully",
            address: updatedAddress
        });
        
    } catch (error) {
        console.error('[Update Address] Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update address' 
        });
    }
});

// Delete address
app.delete('/api/address/delete/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        res.json({
            success: true,
            message: "Address deleted successfully"
        });
        
    } catch (error) {
        console.error('[Delete Address] Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete address' 
        });
    }
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
