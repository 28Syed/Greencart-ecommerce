import Review from '../models/Review.js';
import Product from '../models/Product.js';

// Add Review
const addReview = async (req, res) => {
    const { rating, comment } = req.body;
    const { productId } = req.params;
    const userId = req.user.id; // Assuming user ID is available from auth middleware

    try {
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const alreadyReviewed = await Review.findOne({ product: productId, user: userId });

        if (alreadyReviewed) {
            return res.status(400).json({ success: false, message: "You have already reviewed this product" });
        }

        const review = await Review.create({
            rating,
            comment,
            product: productId,
            user: userId,
        });

        // Update product's average rating and number of reviews
        const reviews = await Review.find({ product: productId });
        const totalRating = reviews.reduce((acc, item) => item.rating + acc, 0);
        product.averageRating = totalRating / reviews.length;
        product.numOfReviews = reviews.length;

        await product.save();

        res.status(201).json({ success: true, message: "Review Added", review });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error adding review" });
    }
};

// Get all reviews for a product
const getReviews = async (req, res) => {
    const { productId } = req.params;

    try {
        const reviews = await Review.find({ product: productId }).populate('user', 'name');
        res.status(200).json({ success: true, reviews });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error fetching reviews" });
    }
};

export { addReview, getReviews };
