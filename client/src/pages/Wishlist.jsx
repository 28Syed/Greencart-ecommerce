import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import ProductCard from "../components/ProductCard";

const Wishlist = () => {
    const { url, token, navigate } = useAppContext();
    const [wishlistProducts, setWishlistProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlist = async () => {
        if (!token) {
            navigate('/'); // Redirect to home if not logged in
            toast.error("Please login to view your wishlist");
            return;
        }
        try {
            const response = await axios.get(`/api/wishlist`);
            if (response.data.success) {
                setWishlistProducts(response.data.wishlist.products);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error fetching wishlist:", error);
            toast.error("Error fetching wishlist");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, [token, url]);

    if (loading) {
        return <p className="text-center mt-10">Loading Wishlist...</p>;
    }

    return (
        <div className="mt-12 min-h-[50vh]">
            <h1 className="text-3xl font-medium text-center mb-8">Your Wishlist</h1>
            {
                wishlistProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 mt-6 w-full">
                        {wishlistProducts.map((product, index) => (
                            <ProductCard key={index} product={product} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-600">Your wishlist is empty. Add some products!</p>
                )
            }
        </div>
    );
};

export default Wishlist;
