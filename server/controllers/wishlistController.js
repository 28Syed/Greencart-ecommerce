import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

// Add product to wishlist
const addToWishlist = async (req, res) => {
    const { productId } = req.params;
    const userId = req.user.id; // Assuming user ID is available from auth middleware
    console.log(`[Wishlist Controller - Add] User ID: ${userId}, Product ID: ${productId}`); // Debug log

    try {
        let wishlist = await Wishlist.findOne({ user: userId });
        console.log("[Wishlist Controller - Add] Existing wishlist:", wishlist); // Debug log

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: userId, products: [] });
            console.log("[Wishlist Controller - Add] New wishlist created."); // Debug log
        }

        if (wishlist.products.includes(productId)) {
            console.log("[Wishlist Controller - Add] Product already in wishlist."); // Debug log
            return res.status(400).json({ success: false, message: "Product already in wishlist" });
        }

        wishlist.products.push(productId);
        await wishlist.save();
        console.log("[Wishlist Controller - Add] Product added to wishlist. New wishlist:", wishlist); // Debug log

        res.status(200).json({ success: true, message: "Product added to wishlist", wishlist });
    } catch (error) {
        console.log("[Wishlist Controller - Add] Error:", error);
        res.status(500).json({ success: false, message: "Error adding to wishlist" });
    }
};

// Remove product from wishlist
const removeFromWishlist = async (req, res) => {
    const { productId } = req.params;
    const userId = req.user.id; // Assuming user ID is available from auth middleware
    console.log(`[Wishlist Controller - Remove] User ID: ${userId}, Product ID: ${productId}`); // Debug log

    try {
        const wishlist = await Wishlist.findOne({ user: userId });
        console.log("[Wishlist Controller - Remove] Existing wishlist:", wishlist); // Debug log

        if (!wishlist) {
            console.log("[Wishlist Controller - Remove] Wishlist not found."); // Debug log
            return res.status(404).json({ success: false, message: "Wishlist not found" });
        }

        wishlist.products = wishlist.products.filter(
            (product) => product.toString() !== productId
        );
        await wishlist.save();
        console.log("[Wishlist Controller - Remove] Product removed from wishlist. New wishlist:", wishlist); // Debug log

        res.status(200).json({ success: true, message: "Product removed from wishlist", wishlist });
    } catch (error) {
        console.log("[Wishlist Controller - Remove] Error:", error);
        res.status(500).json({ success: false, message: "Error removing from wishlist" });
    }
};

// Get user wishlist
const getWishlist = async (req, res) => {
    const userId = req.user.id; // Assuming user ID is available from auth middleware
    console.log(`[Wishlist Controller - Get] User ID: ${userId}`); // Debug log

    try {
        const wishlist = await Wishlist.findOne({ user: userId }).populate('products');
        console.log("[Wishlist Controller - Get] Fetched wishlist:", wishlist); // Debug log

        if (!wishlist) {
            console.log("[Wishlist Controller - Get] Wishlist not found for user. Returning empty."); // Debug log
            return res.status(200).json({ success: true, wishlist: { products: [] } });
        }

        res.status(200).json({ success: true, wishlist });
    } catch (error) {
        console.log("[Wishlist Controller - Get] Error:", error);
        res.status(500).json({ success: false, message: "Error fetching wishlist" });
    }
};

export { addToWishlist, removeFromWishlist, getWishlist };
