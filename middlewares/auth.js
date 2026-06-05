const jwt = require('jsonwebtoken');
const authentication = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]

        if (!token) {
            return res.status(401).json({
                message: 'Token not found'
            })
        }
        const validToken = await jwt.verify(token, process.env.SECRET_KEY, (err, data) => {
            if (err) {
                console.log(err.message)
                return res.status(401).json({
                    message: 'Token validation failed',
                    data: validToken
                })
            }
            req.user = data
            next() 
        })
    } catch (error) {
        console.log(error)
        next(error)
    }
} 

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