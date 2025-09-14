import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Link, useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import ProductCard from "../components/ProductCard";
import axios from "axios";
import toast from "react-hot-toast";

const ProductDetails = () => {

    const {products, navigate, currency, addToCart, url, token} = useAppContext()
    const {id} = useParams()
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [thumbnail, setThumbnail] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState("");

    const product = products.find((item)=> item._id === id);

    useEffect(()=>{
        if(products.length > 0){
            let productsCopy = products.slice();
            productsCopy = productsCopy.filter((item)=> product.category === item.category)
            setRelatedProducts(productsCopy.slice(0,5))
        }
    },[products])

    useEffect(()=>{
        setThumbnail(product?.image[0] ? product.image[0] : null)
    },[product])

    const fetchReviews = async () => {
        if (!product) return;
        try {
            const response = await axios.get(`/api/review/${product._id}`);
            if (response.data.success) {
                setReviews(response.data.reviews);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
            toast.error("Error fetching reviews");
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [product]);

    const submitReview = async () => {
        if (!token) {
            toast.error("Please login to submit a review");
            return;
        }
        if (reviewRating === 0) {
            toast.error("Please provide a star rating");
            return;
        }
        try {
            const response = await axios.post(`/api/review/add/${product._id}`, {
                rating: reviewRating,
                comment: reviewComment,
            });
            if (response.data.success) {
                toast.success(response.data.message);
                setReviewRating(0);
                setReviewComment("");
                fetchReviews(); // Re-fetch reviews to update the list and average rating
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            toast.error("Error submitting review");
        }
    };


    return product && (
        <div className="mt-12">
            <p>
                <Link to={"/"}>Home</Link> /
                <Link to={"/products"}> Products</Link> /
                <Link to={`/products/${product.category.toLowerCase()}`}> {product.category}</Link> /
                <span className="text-primary"> {product.name}</span>
            </p>

            <div className="flex flex-col md:flex-row gap-16 mt-4">
                <div className="flex gap-3">
                    <div className="flex flex-col gap-3">
                        {product.image.map((image, index) => (
                            <div key={index} onClick={() => setThumbnail(image)} className="border max-w-24 border-gray-500/30 rounded overflow-hidden cursor-pointer" >
                                <img src={image} alt={`Thumbnail ${index + 1}`} />
                            </div>
                        ))}
                    </div>

                    <div className="border border-gray-500/30 max-w-100 rounded overflow-hidden">
                        <img src={thumbnail} alt="Selected product" />
                    </div>
                </div>

                <div className="text-sm w-full md:w-1/2">
                    <h1 className="text-3xl font-medium">{product.name}</h1>

                    <div className="flex items-center gap-0.5 mt-1">
                        {Array(5).fill('').map((_, i) => (
                          <img key={i} src={i < Math.round(product.averageRating) ? assets.star_icon : assets.star_dull_icon} alt="" className="md:w-4 w-3.5"/>
                        ))}
                        <p className="text-base ml-2">({product.numOfReviews})</p>
                    </div>

                    <div className="mt-6">
                        <p className="text-gray-500/70 line-through">MRP: {currency}{product.price}</p>
                        <p className="text-2xl font-medium">MRP: {currency}{product.offerPrice}</p>
                        <p className="text-gray-500/70">(inclusive of all taxes)</p>
                    </div>

                    {!product.inStock ? (
                        <p className="text-red-500 font-medium mt-6 text-lg">Out of Stock</p>
                    ) : (
                        <p className="text-green-600 font-medium mt-6 text-lg">In Stock</p>
                    )}

                    <p className="text-base font-medium mt-6">About Product</p>
                    <ul className="list-disc ml-4 text-gray-500/70">
                        {product.description.map((desc, index) => (
                            <li key={index}>{desc}</li>
                        ))}
                    </ul>

                    <div className="flex items-center mt-10 gap-4 text-base">
                        {product.inStock ? (
                            <button onClick={()=> addToCart(product._id)} className="w-full py-3.5 cursor-pointer font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition" >
                                Add to Cart
                            </button>
                        ) : (
                            <button disabled className="w-full py-3.5 font-medium bg-gray-300 text-gray-600 cursor-not-allowed" >
                                Out of Stock
                            </button>
                        )}

                        {product.inStock ? (
                            <button onClick={()=> {addToCart(product._id); navigate("/cart")}} className="w-full py-3.5 cursor-pointer font-medium bg-primary text-white hover:bg-primary-dull transition" >
                                Buy now
                            </button>
                        ) : (
                            <button disabled className="w-full py-3.5 font-medium bg-gray-300 text-gray-600 cursor-not-allowed" >
                                Buy now
                            </button>
                        )}
                    </div>

                    {/* Product Reviews */}
                    <div className="mt-10">
                        <h2 className="text-2xl font-medium">Customer Reviews</h2>
                        {reviews.length > 0 ? (
                            <div className="mt-4 space-y-4">
                                {reviews.map((review) => (
                                    <div key={review._id} className="border p-4 rounded-md">
                                        <div className="flex items-center gap-0.5 mb-2">
                                            {Array(5).fill('').map((_, i) => (
                                                <img key={i} src={i < review.rating ? assets.star_icon : assets.star_dull_icon} alt="" className="w-3.5"/>
                                            ))}
                                        </div>
                                        <p className="font-medium">{review.user.name}</p>
                                        <p className="text-gray-600">{review.comment}</p>
                                        <p className="text-xs text-gray-400 mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-4 text-gray-600">No reviews yet. Be the first to review this product!</p>
                        )}

                        <div className="mt-8 p-4 border rounded-md">
                            <h3 className="text-xl font-medium mb-4">Write a Review</h3>
                            <div className="flex items-center gap-1 mb-4">
                                <p>Your Rating:</p>
                                {Array(5).fill('').map((_, i) => (
                                    <img
                                        key={i}
                                        src={i < reviewRating ? assets.star_icon : assets.star_dull_icon}
                                        alt=""
                                        className="w-5 cursor-pointer"
                                        onClick={() => setReviewRating(i + 1)}
                                    />
                                ))}
                            </div>
                            <textarea
                                className="w-full p-2 border rounded-md resize-none focus:outline-none focus:border-primary"
                                rows="4"
                                placeholder="Share your thoughts about this product..."
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                            ></textarea>
                            <button
                                className="mt-4 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dull transition"
                                onClick={submitReview}
                            >
                                Submit Review
                            </button>
                        </div>

                    </div>

                </div>
            </div>
            {/* ---------- related products -------------- */}
            <div className="flex flex-col items-center mt-20">
                <div className="flex flex-col items-center w-max">
                    <p className="text-3xl font-medium">Related Products</p>
                    <div className="w-20 h-0.5 bg-primary rounded-full mt-2"></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6 w-full">
                    {relatedProducts.filter((product)=>product.inStock).map((product, index)=>(
                        <ProductCard key={index} product={product}/>
                    ))}
                </div>
                <button onClick={()=> {navigate('/products'); scrollTo(0,0)}} className="mx-auto cursor-pointer px-12 my-16 py-2.5 border rounded text-primary hover:bg-primary/10 transition">See more</button>
            </div>
        </div>
    );
};


export default ProductDetails