const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const userModel = require('../models/user')
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async(accessToken, refreshToken, profile, cb) => {
    try {
        console.log('profile', profile)
        //Check if the user has already signed up 
      let user = await userModel.findOne({email: profile._json.email});

      //If the user has not signed up, create a new user with the details from the google profile
      if(!user){
        //Disclaimer, nothing should be hard coded
        user = new userModel({
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            phoneNumber: `${Math.floor(Math.random() * 1E11)}`,
            email: profile._json.email,
            password: ' ',
            confirmPassword: ' ',
            profilePicture: profile._json.picture,
            isVerified: profile._json.email_verified
        })

        //save the user details to the database
        await user.save()
      }
      return cb(null, user)

    } catch (error) {
      console.log('Error signing up with google', error.message)
       return cb(error, null) 
    }
  }
));

passport.serializeUser((user, cb) =>{
  cb(null, user.id);
});

passport.deserializeUser(async(id, cb) =>{
  const user = await userModel.findById(id);

  if(!user){
    return cb(new Error('User not found'), null)
  }
  cb(null, user)
});

//passport google to authenticate
const profile = passport.authenticate('google',{scope: ['profile', 'email']});

const loginProfile = passport.authenticate('google', { failureRedirect: '/login', session: false });

module.exports = {passport, profile, loginProfile}