import express from 'express';

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

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
        }
    ]);
});

app.get('/api/user/login', (req, res) => {
    res.json({ message: "Login endpoint working" });
});

app.get('/api/seller/is-auth', (req, res) => {
    res.json({ message: "Seller auth endpoint working" });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
