require('dotenv').config();
const PORT = process.env.PORT
const express = require('express');
const app = express();
const session = require('express-session')


const {passport} = require('./middlewares/userPassport')
const {passport: vendorPassport} = require('./middlewares/vendorPassport')
const vendorRouter = require('./routes/vendorRouter');
const router = require('./routes/userRouter');
const paymentRouter = require('./routes/paymentRouter');

app.use(express.json());
app.use(session({
  secret: 'dabest',
  resave: false,
  saveUninitialized: false
 }))
 app.use(passport.initialize());
 app.use(passport.session())

 app.use('/api/v1/user', router);
app.use('/api/v1/vendor', vendorRouter);
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
