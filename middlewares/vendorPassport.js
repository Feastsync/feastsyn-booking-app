const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const vendorModel = require('../models/vendor')
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async(accessToken, refreshToken, profile, cb) => {
    try {
        console.log('profile', profile)
        //Check if the user has already signed up 
      let vendor = await vendorModel.findOne({email: profile._json.email});

      //If the user has not signed up, create a new user with the details from the google profile
      if(!vendor){
        //Disclaimer, nothing should be hard coded
        vendor = new vendorModel({
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile._json.email,
            profilePicture: profile._json.picture,
            isVerified: profile._json.email_verified,
            profileCompleted: false
        })

        //save the user details to the database
        await vendor.save()
      }
      return cb(null, vendor)

    } catch (error) {
      console.log('Error signing up with google', error.message)
       return cb(null, error) 
    }
  }
));

passport.serializeUser((vendor, cb) =>{
  cb(null, vendor.id);
});

passport.deserializeUser(async(id, cb) =>{
  const vendor = await vendorModel.findById(id);

  if(!vendor){
    return cb(new Error('Vendor not found'), null)
  }
  cb(null, vendor)
});

//passport google to authenticate
const profile = passport.authenticate('google',{scope: ['profile', 'email']});

const loginProfile = passport.authenticate('google', { failureRedirect: '/login' });

module.exports = {passport, profile, loginProfile} 