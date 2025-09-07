import User from "../models/User.js";
import Product from "../models/Product.js"; // Import Product model

// Update User CartData : /api/cart/update
export const updateCart = async (req, res) => {
    try {
        const { cartItems } = req.body;
        const userId = req.user.id; // Get userId from req.user
        console.log(`[Cart Controller - Update] User ID: ${userId}, Incoming Cart Items:`, cartItems);

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Get current cart items for comparison, ensuring it's an valid array of {product, quantity}
        let currentCartItems = user.cartItems || [];
        if (!Array.isArray(currentCartItems) && typeof currentCartItems === 'object') {
            currentCartItems = Object.keys(currentCartItems).map(productId => ({
                product: productId,
                quantity: currentCartItems[productId]
            }));
        }
        // Filter out any invalid items that might not have a product ID
        currentCartItems = currentCartItems.filter(item => item && item.product);
        
        const newCartMap = new Map();
        cartItems.forEach(item => newCartMap.set(item.product.toString(), item.quantity));

        // Track stock changes
        const stockUpdates = [];

        // Process current cart items for decreases or removals
        for (const currentItem of currentCartItems) {
            const productId = currentItem.product.toString();
            const newQuantity = newCartMap.get(productId) || 0;
            const quantityChange = currentItem.quantity - newQuantity; // Positive if quantity decreased or item removed

            if (quantityChange > 0) {
                stockUpdates.push({ productId, change: quantityChange });
            }
        }

        // Process incoming cart items for increases or additions
        for (const incomingItem of cartItems) {
            const productId = incomingItem.product.toString();
            const currentQuantity = currentCartItems.find(item => item.product.toString() === productId)?.quantity || 0;
            const quantityChange = incomingItem.quantity - currentQuantity; // Positive if quantity increased or item added

            if (quantityChange > 0) {
                const product = await Product.findById(productId);
                if (!product) {
                    return res.status(404).json({ success: false, message: `Product with ID ${productId} not found` });
                }
                if (product.stock < quantityChange) {
                    return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}. Only ${product.stock} left.` });
                }
                stockUpdates.push({ productId, change: -quantityChange }); // Negative for stock decrease
            }
        }

        // Apply all stock updates
        for (const update of stockUpdates) {
            await Product.findByIdAndUpdate(update.productId, { $inc: { stock: update.change } });
            console.log(`[Cart Controller - Stock] Product ${update.productId} stock changed by ${update.change}`);
        }

        user.cartItems = cartItems;
        await user.save();
        res.json({ success: true, message: "Cart Updated" });

    } catch (error) {
        console.log("[Cart Controller - Update] Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}