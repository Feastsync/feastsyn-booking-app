require('dotenv').config();
const PORT = process.env.PORT
const express = require('express');
const app = express();
const swagger = require('./swagger');
const swaggerUi = require('swagger-ui-express');
const session = require('express-session')


const {passport} = require('./middlewares/userPassport')
const {passport: vendorPassport} = require('./middlewares/vendorPassport')
const vendorRouter = require('./routes/vendorRouter');
const router = require('./routes/userRouter');
const pricingRouter = require('./routes/pricingRouter');
const paymentRouter = require('./routes/paymentRouter');

const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
	max : 5, // Limit each IP to 5 requests per `window` (here, per 10 minutes).
  message: 'Too many attemps, try again after 10 minutes',
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
	// store: ... , // Redis, Memcached, etc. See below.
});


app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swagger));


app.use(session({
  secret: 'dabest',
  resave: false,
  saveUninitialized: false
 }))
 app.use(passport.initialize());
 app.use(passport.session())

 app.use('/api/v1/user', router);
app.use('/api/v1/vendor', vendorRouter);
app.use('/api/v1', pricingRouter);
app.use('/api/v1/payment', paymentRouter);
 

 app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'  
  })
})

app.use((err, req, res, next)=>{

  if(err.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Session expired: please login to continue'
            })
        }

        if(err.name === 'MulterError'){
          return res.status(400).json({
            message: err.message
          })
        }
  console.log(err.message)
  res.status(500).json({
    message: 'something went wrong'
  })
})

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(()=>{
    console.log('Connected to Database');
  app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})  
}).catch((error) => {
    console.error('Error connecting to Database:', error.message);
}); 
