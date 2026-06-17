require('dotenv').config();
const PORT = process.env.PORT
const express = require('express');
const mongoose = require('mongoose')
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const swagger = require('./swagger');
const swaggerUi = require('swagger-ui-express');
// const session = require('express-session')


const vendorRouter = require('./routes/vendorRouter');
const router = require('./routes/userRouter');
const pricingRouter = require('./routes/pricingRouter');
const paymentRouter = require('./routes/paymentRouter');
const calendarRouter = require('./routes/calendarRouter');
const bookingRouter = require('./routes/bookingRouter');
const kycRouter = require('./routes/kycRouter');
const messageRouter = require('./routes/messageRouter');
const notificationRouter = require('./routes/notificationRouter');
const adminRouter = require('./routes/adminRouter');
const disputeRouter = require('./routes/disputeRouter'); 
const reviewRouter = require('./routes/reviewRouter');
const contactRouter = require('./routes/contactRouter');
const vendorSettingRouter = require('./routes/vendorSettingRouter');

const rateLimit = require('express-rate-limit');


const app = express();
const server = http.createServer(app);

// ✅ Create IO instance first
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ⭐ Join room (correct way)
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log("Joined room:", roomId);
  });


  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});




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
app.use(cors());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swagger));

// app.use(session({
//   secret: 'dabest',
//   resave: false,
//   saveUninitialized: false
//  }))

 app.use('/api/v1/user', router);
app.use('/api/v1/vendor', vendorRouter);
app.use('/api/v1', pricingRouter);
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/calendar', calendarRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/kyc', kycRouter);
app.use('/api/v1/message', messageRouter);
app.use('/api/v1/notification', notificationRouter);
app.use('/api/v1/admin', adminRouter);
app.use('api/v1/dispute', disputeRouter);
app.use('/api/v1/review', reviewRouter);
app.use('/api/v1/contact', contactRouter);
app.use('/api/v1/settings', vendorSettingRouter)

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
if (err.code == 11000) {
    const field = Object.keys(err.keyValue)[0];

    return res.status(409).json({
        message: `${field} already exists`,
  
    });
} 
     
        if(err.name === 'MulterError'){
          return res.status(400).json({
            message: err.message
          })
        }
  console.log(err.message)
  res.status(500).json({
    message: 'An error occurred while processing your request'
  })
})
const db = process.env.MONGODB_URI;
mongoose.connect(db).then(()=> {
    console.log('Database connection has been established successfully');
    server.listen(PORT, ()=>{
    console.log(`Server is running on the PORT: ${PORT}` );  
})
}).catch((error=> {
    console.error(`Error connecting to Database: ${error.message}`);
}))