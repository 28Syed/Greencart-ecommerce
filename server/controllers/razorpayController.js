import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import crypto from 'crypto';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async (req, res) => {
    try {
        const { amount, addressId, items } = req.body;
        const userId = req.user.id;

        console.log("[Razorpay Controller - Create Order] Request data:", { amount, addressId, items, userId });
        console.log("[Razorpay Controller - Create Order] Razorpay config:", { 
            key_id: process.env.RAZORPAY_KEY_ID ? "Present" : "Missing",
            key_secret: process.env.RAZORPAY_KEY_SECRET ? "Present" : "Missing"
        });

        if (!addressId || !items || items.length === 0 || !amount) {
            return res.status(400).json({ success: false, message: "Invalid data provided for order creation." });
        }

        // Verify stock before creating Razorpay order
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ success: false, message: `Product with ID ${item.product} not found.` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}. Only ${product.stock} left.` });
            }
        }

        // Create a pending order in your database
        const newOrder = await Order.create({
            userId,
            items,
            amount,
            address: addressId,
            paymentType: "Online",
            isPaid: false, // Mark as false initially
        });

        const options = {
            amount: amount * 100, // Razorpay expects amount in paisa
            currency: "INR", // Or your desired currency
            receipt: newOrder._id.toString(),
            payment_capture: 1 // Auto capture payment
        };

        const razorpayOrder = await razorpay.orders.create(options);

        res.json({
            success: true,
            order: razorpayOrder,
            newOrderId: newOrder._id, // Send your internal order ID
        });

    } catch (error) {
        console.error("[Razorpay Controller - Create Order] Error:", error);
        console.error("[Razorpay Controller - Create Order] Error Message:", error.message);
        console.error("[Razorpay Controller - Create Order] Error Stack:", error.stack);
        res.status(500).json({ success: false, message: "Error creating Razorpay order.", error: error.message });
    }
};

export const verifyRazorpayPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId // Your internal order ID
        } = req.body;

        const userId = req.user.id;

        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generated_signature = hmac.digest('hex');

        if (generated_signature === razorpay_signature) {
            // Payment is successful, update your internal order status
            const order = await Order.findByIdAndUpdate(orderId, {
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                isPaid: true,
            }, { new: true });

            if (!order) {
                return res.status(404).json({ success: false, message: "Order not found." });
            }

            // Decrement stock for each product and clear user's cart
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
            }

            const user = await User.findById(userId);
            if (user) {
                user.cartItems = [];
                await user.save();
            }

            res.json({ success: true, message: "Payment successful and order placed." });
        } else {
            // Payment verification failed
            // Optionally, update the order status to failed or cancel it
            await Order.findByIdAndDelete(orderId); // Delete the pending order
            res.status(400).json({ success: false, message: "Payment verification failed." });
        }

    } catch (error) {
        console.error("[Razorpay Controller - Verify Payment] Error:", error.message);
        res.status(500).json({ success: false, message: "Error verifying payment." });
    }
};
