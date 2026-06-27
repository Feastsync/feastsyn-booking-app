const jwt = require("jsonwebtoken");
const authentication = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Token not found"
            });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        req.user = decoded;

        console.log("Decoded User:", req.user);

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Token validation failed"
        });
    }
}; 

const adminAuth = async (req, res, next) => {
    if(req.user.role !== 'admin'){
        return res.status(403).json({
            message: 'Unauthorized Access'
        })
    }
    next()
} 

module.exports = {
    authentication,
    adminAuth
}