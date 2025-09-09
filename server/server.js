import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://greencart-frontend-lqi9ktkjt-syed-ikrams-projects.vercel.app',
        'https://greencart-frontend.vercel.app'
    ],
    credentials: true
}));

// Routes
app.get('/', (req, res) => {
    res.json({ message: "API is Working" });
});

app.get('/api/products', (req, res) => {
    res.json([
        {
            _id: "1",
            name: "Fresh Apples",
            price: 299,
            image: "/assets/apple_image.png",
            category: "fruits",
            inStock: true
        },
        {
            _id: "2",
            name: "Organic Bananas", 
            price: 199,
            image: "/assets/banana_image_1.png",
            category: "fruits",
            inStock: true
        },
        {
            _id: "3",
            name: "Fresh Carrots",
            price: 149,
            image: "/assets/carrot_image.png",
            category: "vegetables",
            inStock: true
        }
    ]);
});

app.get('/api/user/login', (req, res) => {
    res.json({ message: "Login endpoint working" });
});

app.get('/api/seller/is-auth', (req, res) => {
    res.json({ message: "Seller auth endpoint working" });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
