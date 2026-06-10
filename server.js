require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose')
const http = require('http');
const {Server} = require('socket.io')
const cors = require('cors');

//Routers
const vendorRouter = require('./routes/vendorRouter');
const router = require('./routes/userRouter');
const pricingRouter = require('./routes/pricingRouter');
const paymentRouter = require('./routes/paymentRouter');
const calendarRouter = require('./routes/calendarRouter');
const bookingRouter = require('./routes/bookingRouter');
const kycRouter = require('./routes/kycRouter')


// const { initializeIO } = require('./controllers/messageController');

const app = express();
app.use(cors({origin: '*'}));
const server = http.createServer(app);

// ✅ Create IO instance first
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
  
  // // ✅ Now initialize IO globally for the controller
// initializeIO(io);
// console.log("✅ initializeIO called in server.js")

// Import modular Socket.IO logic
// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   // ⭐ Join room (correct way)
//   socket.on("join_room", (roomId) => {
//     socket.join(roomId);
//     console.log("Joined room:", roomId);
//   });


//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);
//   });
// });

//Rate limiter
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

// ---- MIDDLEWARES ----\
app.use(express.json());


// ---- ROUTES ----
app.use('/api/v1/user', router);
app.use('/api/v1/vendor', vendorRouter);
app.use('/api/v1', pricingRouter);
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/schedule', calendarRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/kyc', kycRouter)

// Swagger setup
const swagger = require('./swagger');
const swaggerUi = require('swagger-ui-express');

// const options = { swaggerDefinition, apis:['/routes/*.js']};
// const swaggerSpec = swaggerJSDoc(options);
// app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swagger));

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to Feastsync Server!');
});

//Global error handler
 app.use((error,req, res, next) => {
  if(error){
  res.status(500).json({
    message: error.message
  });
}
next()
});

  app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
});

// ---- START SERVER --
const PORT = process.env.PORT || 4900;
const db = process.env.MONGODB_URI;
mongoose.connect(db).then(()=> {
    console.log('Database connection has been established successfully');
    app.listen(PORT, ()=>{
    console.log(`Server is running on the PORT: ${PORT}` );  
})
}).catch((error=> {
    console.error(`Error connecting to Database: ${error.message}`);
}))

