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

// Product routes
app.get('/api/product/list', (req, res) => {
    res.json([
        // Vegetables
        {
            _id: "gd46g23h",
            name: "Potato 500g",
            category: "Vegetables",
            price: 25,
            offerPrice: 20,
            image: ["/src/assets/potato_image_1.png", "/src/assets/potato_image_2.png", "/src/assets/potato_image_3.png", "/src/assets/potato_image_4.png"],
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
            image: ["/src/assets/tomato_image.png"],
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
            image: ["/src/assets/carrot_image.png"],
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
            image: ["/src/assets/spinach_image_1.png"],
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
            image: ["/src/assets/onion_image_1.png"],
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
            image: ["/src/assets/apple_image.png"],
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
            image: ["/src/assets/orange_image.png"],
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
            image: ["/src/assets/banana_image_1.png"],
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
            image: ["/src/assets/mango_image_1.png"],
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
            image: ["/src/assets/grapes_image_1.png"],
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
            image: ["/src/assets/amul_milk_image.png"],
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
            image: ["/src/assets/paneer_image.png"],
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
            image: ["/src/assets/eggs_image.png"],
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
            image: ["/src/assets/paneer_image_2.png"],
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
            image: ["/src/assets/cheese_image.png"],
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
            image: ["/src/assets/coca_cola_image.png"],
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
            image: ["/src/assets/pepsi_image.png"],
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
            image: ["/src/assets/sprite_image_1.png"],
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
            image: ["/src/assets/fanta_image_1.png"],
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
            image: ["/src/assets/seven_up_image_1.png"],
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
            image: ["/src/assets/basmati_rice_image.png"],
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
            image: ["/src/assets/wheat_flour_image.png"],
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
            image: ["/src/assets/quinoa_image.png"],
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
            image: ["/src/assets/brown_rice_image.png"],
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
            image: ["/src/assets/barley_image.png"],
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
            image: ["/src/assets/brown_bread_image.png"],
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
            image: ["/src/assets/butter_croissant_image.png"],
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
            image: ["/src/assets/chocolate_cake_image.png"],
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
            image: ["/src/assets/whole_wheat_bread_image.png"],
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
            image: ["/src/assets/vanilla_muffins_image.png"],
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
            image: ["/src/assets/maggi_image.png"],
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
            image: ["/src/assets/top_ramen_image.png"],
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
            image: ["/src/assets/knorr_soup_image.png"],
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
            image: ["/src/assets/yippee_image.png"],
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
            image: ["/src/assets/maggi_oats_image.png"],
            description: [
                "Healthy alternative with oats",
                "Good for digestion",
                "Perfect for breakfast or snacks",
            ],
            createdAt: "2025-03-25T07:17:46.018Z",
            updatedAt: "2025-03-25T07:18:13.103Z",
            inStock: true,
        }
    ]);
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

// Chat routes
app.post('/api/chat/session', (req, res) => {
    res.json({
        success: true,
        sessionId: "session123"
    });
});

app.post('/api/chat/message', (req, res) => {
    res.json({
        success: true,
        message: "AI response"
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
