import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import path from 'path'; // Import path module
import { fileURLToPath } from 'url'; // Import fileURLToPath
import connectDB from './configs/db.js';
import 'dotenv/config';
import userRouter from './routes/userRoute.js';
import sellerRouter from './routes/sellerRoute.js';
import connectCloudinary from './configs/cloudinary.js';
import productRouter from './routes/productRoute.js';
import Product from './models/Product.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import Address from './models/Address.js';
import Chat from './models/Chat.js';
import orderRouter from './routes/orderRoute.js';
import reviewRouter from './routes/reviewRoute.js';
import wishlistRouter from './routes/wishlistRoute.js';
import razorpayRouter from './routes/razorpayRoute.js';
import chatRouter from './routes/chatRoute.js';
// import { stripeWebhooks } from './controllers/orderController.js';

const app = express();
const port = process.env.PORT || 4000;

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await connectDB()
await connectCloudinary()

// Allow multiple origins
const allowedOrigins = ['http://localhost:5173', 'https://greencart-deploy-9xaj.vercel.app']

// app.post('/stripe', express.raw({type: 'application/json'}), stripeWebhooks)

// Middleware configuration
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins, credentials: true}));

// Serve static assets from the client/src/assets directory
app.use('/assets', cors({origin: allowedOrigins}), express.static(path.join(__dirname, '..', 'client', 'src', 'assets')));

app.get('/', (req, res) => res.send("API is Working"));
app.use('/api/user', userRouter)
app.use('/api/seller', sellerRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/address', addressRouter)
app.use('/api/order', orderRouter)
app.use('/api/review', reviewRouter)
app.use('/api/wishlist', wishlistRouter)
app.use('/api/razorpay', razorpayRouter)
app.use('/api/chat', chatRouter)

// Global uncaught exception handler for better debugging
process.on('uncaughtException', (err) => {
    console.error('[UNCAUGHT EXCEPTION] Caught exception:', err);
    // It's important to exit the process after an uncaught exception
    // to prevent the application from being in an unknown state.
    process.exit(1);
});

app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`)
})