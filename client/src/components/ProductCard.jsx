import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";


const ProductCard = ({product}) => {
    const {currency, addToCart, removeFromCart, cartItems, navigate, url, token} = useAppContext()
    const [isWishlisted, setIsWishlisted] = useState(false);

    useEffect(() => {
        const checkWishlist = async () => {
            if (token && product?._id) {
                try {
                    const response = await axios.get(`/api/wishlist`);
                    if (response.data.success) {
                        setIsWishlisted(response.data.wishlist.products.some(item => item._id === product._id));
                    }
                } catch (error) {
                    console.error("Error checking wishlist:", error);
                }
            }
        };
        checkWishlist();
    }, [token, product, url]);

    const handleWishlistToggle = async (e) => {
        e.stopPropagation(); // Prevent navigating to product details
        if (!token) {
            toast.error("Please login to manage your wishlist");
            return;
        }

        try {
            let response;
            if (isWishlisted) {
                response = await axios.delete(`/api/wishlist/remove/${product._id}`);
            } else {
                response = await axios.post(`/api/wishlist/add/${product._id}`, {});
            }

            if (response.data.success) {
                setIsWishlisted(!isWishlisted);
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error toggling wishlist:", error);
            toast.error("Error toggling wishlist");
        }
    };

    return product && (
        <div onClick={()=> {navigate(`/products/${product.category.toLowerCase()}/${product._id}`); scrollTo(0,0)}} className="border border-gray-500/20 rounded-md md:px-4 px-3 py-2 bg-white min-w-56 max-w-56 w-full relative pt-10">
            <div className="group cursor-pointer flex items-center justify-center px-2">
                <img className="group-hover:scale-105 transition max-w-26 md:max-w-36" src={product.image[0]} alt={product.name} />
            </div>
            <div className="text-gray-500/60 text-sm">
                <p>{product.category}</p>
                <p className="text-gray-700 font-medium text-lg truncate w-full">{product.name}</p>
                {!product.inStock ? (
                    <p className="text-red-500 font-medium">Out of Stock</p>
                ) : (
                    <p className="text-green-600 text-sm">In Stock</p>
                )}
                <div className="flex items-center gap-0.5">
                    {Array(5).fill('').map((_, i) => (
                           <img key={i} className="md:w-3.5 w3" src={i < Math.round(product.averageRating) ? assets.star_icon : assets.star_dull_icon} alt=""/>
                    ))}
                    <p>({product.numOfReviews})</p>
                </div>
                <div className="flex items-end justify-between mt-3">
                    <p className="md:text-xl text-base font-medium text-primary">
                        {currency}{product.offerPrice}{" "} <span className="text-gray-500/60 md:text-sm text-xs line-through">{currency}{product.price}</span>
                    </p>
                    <div onClick={(e) => { e.stopPropagation(); }} className="text-primary">
                        {!cartItems[product._id] && product.stock > 0 ? (
                            <button className="flex items-center justify-center gap-1 bg-primary/10 border border-primary/40 md:w-[80px] w-[64px] h-[34px] rounded cursor-pointer" onClick={() => addToCart(product._id)} >
                                <img src={assets.cart_icon} alt="cart_icon"/>
                                Add
                            </button>
                        ) : product.stock === 0 ? (
                            <button disabled className="flex items-center justify-center gap-1 bg-gray-300 border border-gray-400 md:w-[80px] w-[64px] h-[34px] rounded cursor-not-allowed text-gray-600">
                                Out
                            </button>
                        ) : (
                            <div className="flex items-center justify-center gap-2 md:w-20 w-16 h-[34px] bg-primary/25 rounded select-none">
                                <button onClick={() => {removeFromCart(product._id)}} className="cursor-pointer text-md px-2 h-full" >
                                    -
                                </button>
                                <span className="w-5 text-center">{cartItems[product._id]}</span>
                                <button onClick={() => {addToCart(product._id)}} className="cursor-pointer text-md px-2 h-full" >
                                    +
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <img
                src={isWishlisted ? assets.heart_icon : assets.heart_dull_icon}
                alt="wishlist icon"
                className="absolute top-1 right-1 w-6 h-6 cursor-pointer"
                onClick={handleWishlistToggle}
            />
        </div>
    );
};

export default ProductCard;