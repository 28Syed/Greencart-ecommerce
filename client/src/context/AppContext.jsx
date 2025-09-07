import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

// Axios Interceptor to add Authorization header
axios.interceptors.request.use(function (config) {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const AppContext = createContext();

export const AppContextProvider = ({children})=>{

    const currency = import.meta.env.VITE_CURRENCY;

    const navigate = useNavigate();
    const [user, setUser] = useState(null)
    const [isSeller, setIsSeller] = useState(false)
    const [showUserLogin, setShowUserLogin] = useState(false)
    const [products, setProducts] = useState([])

    const [cartItems, setCartItems] = useState({})
    const [searchQuery, setSearchQuery] = useState({})
    const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    const url = import.meta.env.VITE_BACKEND_URL; // Define url here

  // Fetch Seller Status
  const fetchSeller = async ()=>{
    try {
        const {data} = await axios.get('/api/seller/is-auth');
        if(data.success){
            setIsSeller(true)
        }else{
            setIsSeller(false)
        }
    } catch (error) {
        setIsSeller(false)
    }
  }

  // New function to handle user login and token storage
  const userLogin = (userData, userToken) => {
    setUser(userData);
    localStorage.setItem("token", userToken);
    toast.success("Logged In Successfully");
    setShowUserLogin(false);
  };

  // Logout function
  const logout = async () => {
    try {
      const response = await axios.get('/api/user/logout');
      if (response.data.success) {
        setUser(null);
        setIsSeller(false);
        setCartItems({});
        localStorage.removeItem("token");
        toast.success("Logged Out Successfully");
        navigate('/');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error logging out");
    }
  };

    // Fetch User Auth Status , User Data and Cart Items
const fetchUser = async ()=>{
    try {
        const storedToken = localStorage.getItem("token"); // Get token from local storage
        if (!storedToken) {
            setUser(null); // No token, ensure user is null
            return; // Exit if no token
        }
        
        // Use the stored token to verify with the backend
        const {data} = await axios.get('api/user/is-auth', { headers: { Authorization: `Bearer ${storedToken}` } });
        if (data.success){
            setUser(data.user)
            setCartItems(data.user.cartItems)
            // localStorage.setItem("token", data.token); // Removed: token already from localStorage, or from login
        }else{
            setUser(null)
            localStorage.removeItem("token"); // Clear token on failure
        }
    } catch (error) {
        setUser(null)
        localStorage.removeItem("token"); // Clear token on error
    }
}

// Add token to context value
const token = localStorage.getItem("token"); // This variable will be updated by useEffect on login

    // Fetch All Products
    const fetchProducts = async ()=>{
        try {
            const { data } = await axios.get('/api/product/list')
            if(data.success){
                setProducts(data.products)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

// Add Product to Cart
const addToCart = (itemId)=>{
    let cartData = structuredClone(cartItems);

    if(cartData[itemId]){
        cartData[itemId] += 1;
    }else{
        cartData[itemId] = 1;
    }
    setCartItems(cartData);
    toast.success("Added to Cart")
}

  // Update Cart Item Quantity
  const updateCartItem = (itemId, quantity)=>{
    let cartData = structuredClone(cartItems);
    cartData[itemId] = quantity;
    setCartItems(cartData)
    toast.success("Cart Updated")
  }

// Remove Product from Cart
const removeFromCart = (itemId)=>{
    let cartData = structuredClone(cartItems);
    if(cartData[itemId]){
        cartData[itemId] -= 1;
        if(cartData[itemId] === 0){
            delete cartData[itemId];
        }
    }
    toast.success("Removed from Cart")
    setCartItems(cartData)
}

  // Get Cart Item Count
  const getCartCount = ()=>{
    let totalCount = 0;
    for(const item in cartItems){
        totalCount += cartItems[item];
    }
    return totalCount;
  }

// Get Cart Total Amount
const getCartAmount = () =>{
    let totalAmount = 0;
    for (const items in cartItems){
        let itemInfo = products.find((product)=> product._id === items);
        if(cartItems[items] > 0){
            totalAmount += itemInfo.offerPrice * cartItems[items]
        }
    }
    return Math.floor(totalAmount * 100) / 100;
}


    useEffect(()=>{
        fetchUser()
        fetchSeller()
        fetchProducts()
    },[])

    // Update Database Cart Items
    useEffect(()=>{
        const updateCart = async ()=>{
            try {
                // Transform cartItems object to array of objects for the backend
                const formattedCartItems = Object.keys(cartItems).map(itemId => ({
                    product: itemId,
                    quantity: cartItems[itemId]
                }));
                console.log("[App Context - Update Cart] Sending to backend:", formattedCartItems);

                const { data } = await axios.post('/api/cart/update', {cartItems: formattedCartItems})
                if (data.success){
                    // Only refresh products if the cart update was successful
                    fetchProducts(); 
                } else{
                    toast.error(data.message)
                }
            } catch (error) {
                toast.error(error.message)
            }
        }

        if(user){
            updateCart()
        }
    },[cartItems])

    const value = {navigate, user, setUser, setIsSeller, isSeller,
        showUserLogin, setShowUserLogin, products, currency, addToCart, updateCartItem, removeFromCart, cartItems, searchQuery, setSearchQuery, getCartAmount, getCartCount, axios, fetchProducts, setCartItems, razorpayKeyId, url, token, userLogin, logout
    }

    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}

export const useAppContext = ()=>{
    return useContext(AppContext)
}
