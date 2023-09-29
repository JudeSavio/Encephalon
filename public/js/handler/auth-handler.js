require('dotenv').config();

// PASSPORT MIDDLEWARE FOR AUTHENTICATION
const passport = require('passport');
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID, // Created in Developer Console.
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Created in Developer Console.
    callbackURL: "http://localhost:3000/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
      return done(null, profile); // We are not maintaining a database here so we've simply returning the profile from the call back
  }
));

// We need to serialize and deserialixe the user
passport.serializeUser(function(user,done) {
    done(null,user)
});

passport.deserializeUser(function(user,done) {
    done(null,user)
});