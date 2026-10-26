import jwt from "jsonwebtoken";
import User from "../Models/userModels.js";

const isLogin = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: "Unauthorized - No Token Provided!" 
            });
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);
        if (!decode) {
            return res.status(401).json({ 
                success: false, 
                message: "Unauthorized - Invalid Token" 
            });
        }

        // Handles both decode.userId and decode._id or decode.id
        const targetUserId = decode.userId || decode._id || decode.id;

        if (!targetUserId) {
            return res.status(401).json({ 
                success: false, 
                message: "Unauthorized - Token missing user ID payload" 
            });
        }

        const user = await User.findById(targetUserId).select("-password");

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User Not Found!" 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error(`Error in isLogin middleware: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

export default isLogin;