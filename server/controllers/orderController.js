import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Address from "../models/Address.js";

// Place Order COD : /api/order/cod
export const placeOrderCOD = async (req, res) => {
    try {
        const { items, address } = req.body;
        const userId = req.user.id; // Get userId from req.user

        console.log(`[PlaceOrderCOD] User ID: ${userId}`);
        console.log(`[PlaceOrderCOD] Incoming items:`, items);
        console.log(`[PlaceOrderCOD] Selected address ID: ${address}`);

        if (!address || items.length === 0) {
            return res.json({ success: false, message: "Invalid data" });
        }

        // Verify stock and calculate amount
        let amount = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ success: false, message: `Product with ID ${item.product} not found` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}. Only ${product.stock} left.` });
            }
            amount += product.offerPrice * item.quantity;
        }

        console.log(`[PlaceOrderCOD] Calculated initial amount: ${amount}`);

        // Add Tax Charge (2%)
        amount += Math.floor(amount * 0.02);

        console.log(`[PlaceOrderCOD] Amount after tax: ${amount}`);

        // Decrement stock for each product and clear cart
        for (const item of items) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
        }

        // Clear user's cart after successful order
        const user = await User.findById(userId);
        if (user) {
            user.cartItems = [];
            await user.save();
        }

        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "COD",
        });

        return res.json({ success: true, message: "Order Placed Successfully" });
    } catch (error) {
        console.error("[Order Controller - Place Order COD] Error:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
}

// Get Orders by User ID : /api/order/user
export const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id; // Get userId from req.user
        let orders = await Order.find({
            userId,
            $or: [{ paymentType: "COD" }, { isPaid: true }]
        }).populate("items.product address").sort({ createdAt: -1 });

        // Filter out any orders or order items where product population failed (product is null)
        orders = orders.filter(order => order.items.every(item => item.product));

        res.json({ success: true, orders });
    } catch (error) {
        console.error("[Order Controller - Get User Orders] Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Get All Orders (for seller / admin) : /api/order/seller
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [{ paymentType: "COD" }, { isPaid: true }]
        }).populate("items.product address").sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        console.error("[Order Controller - Get All Orders] Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}