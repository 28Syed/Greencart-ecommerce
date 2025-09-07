import jwt from 'jsonwebtoken';

const authUser = async (req, res, next)=>{
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header
    console.log("Auth Middleware: Received token:", token); // Debug log

    if(!token){
        console.log("Auth Middleware: No token found."); // Debug log
        return res.json({ success: false, message: 'Not Authorized' });
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)
        console.log("Auth Middleware: Token decoded:", tokenDecode); // Debug log
        if(tokenDecode.id){
            req.user = { id: tokenDecode.id }; // Attach user info to req.user
            console.log("Auth Middleware: User ID attached:", req.user.id); // Debug log
        }else{
            console.log("Auth Middleware: Token decoded but no user ID."); // Debug log
            return res.json({ success: false, message: 'Not Authorized' });
        }
        next();

    } catch (error) {
        console.log("Auth Middleware: Token verification failed:", error.message); // Debug log
        res.json({ success: false, message: 'Not Authorized' }); // Changed to generic Not Authorized
    }
}

export default authUser;