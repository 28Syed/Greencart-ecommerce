import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets, dummyAddress } from "../assets/assets";
import toast from "react-hot-toast";

const Cart = () => {
    const {products, currency, cartItems, removeFromCart, getCartCount, updateCartItem, navigate, getCartAmount, axios, user, setCartItems, razorpayKeyId, url} = useAppContext()
    const [cartArray, setCartArray] = useState([])
    const [addresses, setAddresses] = useState([])
    const [showAddress, setShowAddress] = useState(false)
    const [selectedAddress, setSelectedAddress] = useState(null)
    const [paymentOption, setPaymentOption] = useState("COD")

    const getCart = ()=>{
        let tempArray = []
        for(const key in cartItems){
            const product = products.find((item)=>item._id === key)
            product.quantity = cartItems[key]
            tempArray.push(product)
        }
        setCartArray(tempArray)
    }

    const getUserAddress = async ()=>{
        try {
            const {data} = await axios.get('/api/address/get');
            if (data.success){
                setAddresses(data.addresses)
                if(data.addresses.length > 0){
                    setSelectedAddress(data.addresses[0])
                }
            }else{
                toast.error(data.message)
            }
            
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(()=>{
        if(products.length > 0 && cartItems){
            getCart()
        }
    },[products, cartItems])

    // Function to load the Razorpay script dynamically
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            // Check if Razorpay is already loaded
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            script.onload = () => {
                console.log("Razorpay script loaded successfully");
                console.log("Razorpay object:", window.Razorpay);
                resolve(true);
            };
            script.onerror = (error) => {
                console.error("Failed to load Razorpay script:", error);
                resolve(false);
            };
            document.head.appendChild(script);
        });
    };

    const placeOrder = async ()=>{
        try {
            if(!selectedAddress){
                return toast.error("Please select an address")
            }

            // Calculate total amount with tax
            let totalAmount = getCartAmount() + getCartAmount() * 2 / 100;

            // Place Order with COD
            if(paymentOption === "COD"){
                const {data} = await axios.post('/api/order/cod', {
                    userId: user._id,
                    items: cartArray.map(item=> ({product: item._id, quantity: item.quantity})),
                    address: selectedAddress._id
                })

                if(data.success){
                    toast.success(data.message)
                    setCartItems({})
                    navigate('/my-orders')
                }else{
                    toast.error(data.message)
                }
            } else if (paymentOption === "Online") {
                // Place Order with Razorpay
                console.log("Loading Razorpay script...");
                const res = await loadRazorpayScript();

                if (!res) {
                    toast.error("Razorpay SDK failed to load. Please try Cash on Delivery instead.");
                    return;
                }
                
                console.log("Razorpay script loaded, proceeding with payment...");

                try {
                    const orderData = await axios.post('/api/razorpay/order', {
                        amount: totalAmount,
                        addressId: selectedAddress._id,
                        items: cartArray.map(item=> ({product: item._id, quantity: item.quantity})),
                    });

                    if (orderData.data.success) {
                        const order = orderData.data.order;
                        const newOrderId = order.id;

                        console.log("Creating Razorpay payment with options:", {
                            key: razorpayKeyId,
                            amount: order.amount,
                            currency: order.currency,
                            order_id: order.id
                        });

                        console.log("Razorpay object available:", !!window.Razorpay);
                        console.log("Razorpay key being used:", razorpayKeyId);

                        const options = {
                            key: razorpayKeyId,
                            amount: order.amount,
                            currency: order.currency,
                            name: "GreenCart",
                            description: "Payment for your order",
                            order_id: order.id,
                            handler: async function (response) {
                                console.log("Payment successful:", response);
                                const paymentVerification = await axios.post('/api/razorpay/verify', {
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    orderId: newOrderId,
                                });

                                if (paymentVerification.data.success) {
                                    toast.success("Payment successful! Order placed.");
                                    setCartItems({});
                                    navigate('/my-orders');
                                } else {
                                    toast.error("Payment verification failed");
                                }
                            },
                            prefill: {
                                name: user.name,
                                email: user.email,
                                contact: user.phone || "",
                            },
                            notes: {
                                address: `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}`,
                                orderId: newOrderId,
                            },
                            theme: {
                                color: "#80B82D",
                            },
                        };

                        console.log("Opening Razorpay with options:", options);
                        const rzp1 = new window.Razorpay(options);
                        console.log("Razorpay instance created:", rzp1);
                        rzp1.open();

                    } else {
                        toast.error(orderData.data.message);
                    }
                } catch (razorpayError) {
                    console.error("Razorpay payment error:", razorpayError);
                    toast.error("Payment initialization failed. Please try Cash on Delivery instead.");
                }
            }
        } catch (error) {
            console.error("Error placing order:", error);
            console.error("Error response:", error.response?.data);
            console.error("Error status:", error.response?.status);
            toast.error(`Error placing order: ${error.response?.data?.message || error.message}`);
        }
    }


    useEffect(()=>{
        if(user){
            getUserAddress()
        }
    },[user])
    
    return products.length > 0 ? (
        <div className="flex flex-col md:flex-row mt-16">
            <div className='flex-1 max-w-4xl'>
                <h1 className="text-3xl font-medium mb-6">
                    Shopping Cart <span className="text-sm text-primary">{getCartCount()} Items</span>
                </h1>

                <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3">
                    <p className="text-left">Product Details</p>
                    <p className="text-center">Subtotal</p>
                    <p className="text-center">Action</p>
                </div>

                {cartArray.length > 0 ? (
                    cartArray.map((product, index) => (
                        <div key={index} className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-3">
                            <div className="flex items-center md:gap-6 gap-3">
                                <div onClick={()=>{
                                    navigate(`/products/${product.category.toLowerCase()}/${product._id}`); scrollTo(0,0)
                                }} className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded">
                                    <img className="max-w-full h-full object-cover" src={product.image[0]} alt={product.name} />
                                </div>
                                <div>
                                    <p className="hidden md:block font-semibold">{product.name}</p>
                                    <div className="font-normal text-gray-500/70">
                                        <p>Weight: <span>{product.weight || "N/A"}</span></p>
                                        <div className='flex items-center'>
                                            <p>Qty:</p>
                                            <select onChange={e => updateCartItem(product._id, Number(e.target.value))}  value={cartItems[product._id]} className='outline-none'>
                                                {Array(cartItems[product._id] > 9 ? cartItems[product._id] : 9).fill('').map((_, index) => (
                                                    <option key={index} value={index + 1}>{index + 1}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-center">{currency}{product.offerPrice * product.quantity}</p>
                            <button onClick={()=> removeFromCart(product._id)} className="cursor-pointer mx-auto">
                                <img src={assets.remove_icon} alt="remove" className="inline-block w-6 h-6" />
                            </button>
                        </div>)
                    )
                ) : (
                    <div className="text-center py-16">
                        <img src={assets.cart_icon} alt="empty cart" className="w-24 h-24 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-medium text-gray-500 mb-2">Your cart is empty</h3>
                        <p className="text-gray-400 mb-6">Add some products to get started</p>
                        <button onClick={() => navigate("/products")} className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-dull transition">
                            Continue Shopping
                        </button>
                    </div>
                )}

                <button onClick={()=> {navigate("/products"); scrollTo(0,0)}} className="group cursor-pointer flex items-center mt-8 gap-2 text-primary font-medium">
                    <img className="group-hover:-translate-x-1 transition" src={assets.arrow_right_icon_colored} alt="arrow" />
                    Continue Shopping
                </button>

            </div>

            <div className="max-w-[360px] w-full bg-gray-100/40 p-5 max-md:mt-16 border border-gray-300/70">
                <h2 className="text-xl md:text-xl font-medium">Order Summary</h2>
                <hr className="border-gray-300 my-5" />

                <div className="mb-6">
                    <p className="text-sm font-medium uppercase">Delivery Address</p>
                    <div className="relative flex justify-between items-start mt-2">
                        <p className="text-gray-500">{selectedAddress ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}` : "No address found"}</p>
                        <button onClick={() => setShowAddress(!showAddress)} className="text-primary hover:underline cursor-pointer">
                            Change
                        </button>
                        {showAddress && (
                            <div className="absolute top-12 py-1 bg-white border border-gray-300 text-sm w-full">
                               {addresses.map((address, index)=>(
                                <p onClick={() => {setSelectedAddress(address); setShowAddress(false)}} className="text-gray-500 p-2 hover:bg-gray-100">
                                    {address.street}, {address.city}, {address.state}, {address.country}
                                </p>
                            )) }
                                <p onClick={() => navigate("/add-address")} className="text-primary text-center cursor-pointer p-2 hover:bg-primary/10">
                                    Add address
                                </p>
                            </div>
                        )}
                    </div>

                    <p className="text-sm font-medium uppercase mt-6">Payment Method</p>

                    <select onChange={e => setPaymentOption(e.target.value)} className="w-full border border-gray-300 bg-white px-3 py-2 mt-2 outline-none">
                        <option value="COD">Cash On Delivery</option>
                        <option value="Online">Online Payment</option>
                    </select>
                </div>

                <hr className="border-gray-300" />

                <div className="text-gray-500 mt-4 space-y-2">
                    <p className="flex justify-between">
                        <span>Price</span><span>{currency}{getCartAmount()}</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Shipping Fee</span><span className="text-green-600">Free</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Tax (2%)</span><span>{currency}{getCartAmount() * 2 / 100}</span>
                    </p>
                    <p className="flex justify-between text-lg font-medium mt-3">
                        <span>Total Amount:</span><span>
                            {currency}{getCartAmount() + getCartAmount() * 2 / 100}</span>
                    </p>
                </div>

                <button onClick={placeOrder} className="w-full py-3 mt-6 cursor-pointer bg-primary text-white font-medium hover:bg-primary-dull transition">
                    {paymentOption === "COD" ? "Place Order" : "Proceed to Checkout"}
                </button>
            </div>
        </div>
    ) : null
}

export default Cart;