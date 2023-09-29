const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const nodemailer = require('nodemailer');
const passport = require('passport');
const session = require('express-session'); // to maintain sessions for users through cookies.
require('./public/js/handler/auth-handler'); // requiring in the passport middleware into our app

const app = express();
app.use(session({secret:process.env.EXPRESS_SECRET}));
app.use(passport.initialize());
app.use(passport.session());

// Middleware function to see if the user is logged in or not before accessing protected URLs (/profile)
function isLoggedIn(req, res,next) {
  req.user ? next() : res.sendStatus(401) //if the get /profile req has a user associated with it then send to next() middleware else, send the 401 - Un-Authorized Access faliure.
}

app.use(express.static(__dirname + '/public')); 
app.use(express.urlencoded({ extended: true }));

// // Custom middleware to protect the /submit route
// app.use('/submit', (req, res, next) => {
//   // Check if the request originated from a form submission
//   if (req.headers['referer'] && req.headers['referer'].includes('/contact')) {
//     // The request came from the /contact page, proceed to the /submit route
//     next();
//   } else {
//     // Redirect or return an error response to prevent access
//     res.status(403).send('Access to /submit is not allowed.');
//   }
// });

// COMPLETE AUTHENTICATION HANDLER //

// Setting up the /auth/google route when the user hits login button
app.get('/auth/google', passport.authenticate('google', {scope: ['email','profile']}) )

// now we need to set up /google/callback endpoint behaviour - this determines what to do with successful / failed authentication
app.get('/google/callback', 
  passport.authenticate('google', {
    successRedirect: '/profile',
    faliureRedirect: '/auth/faliure'
  })
);

//defining the auth faliure route
app.get('/auth/faliure', (req,res) => {
  res.send("Something went wrong") // 401 Authorization Faliure
});

// Home page is served.
app.get('/home', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Contact page is served - with isLoggedIn middleware
app.get('/contact',isLoggedIn , (req, res) => {
  res.sendFile(__dirname + '/views/contact.html');
});

// Submit page is served. - with isLoggedIn middleware
app.get('/submit', isLoggedIn , (req, res) => {
  res.sendFile(__dirname + '/views/submit.html');
});

// Login page is served.
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/views/login.html');
});

// Signup page is served.
app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/views/signup.html');
});

// Profile is served - with isLoggedIn middleware
app.get('/profile', isLoggedIn , (req , res) => {
  res.send(`Hello ${req.user.displayName}`);
});

// logout page is served.
app.get('/logout' , (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.session.destroy()
    res.redirect('/home');
  });
});


// POST - /submit for mail-handler
app.post('/submit', (req, res) => {

  const { firstName, lastName, email, message } = req.body;
    
  // Use Nodemailer to send an email
  var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAILUSER,
      pass: process.env.MAILPASS
    }
  });

  mailBody = message
  fromEmail = email
  mailSubject = 'Contact Request recieved from ' + firstName + ' ' + lastName

  const mailOptions = {
    from: fromEmail,
    to: 'team.encephalon@gmail.com',
    subject: mailSubject,
    text: mailBody,
  };

  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.send('Error sending the email');
    } else {
      console.log('Email sent: ' + info.response);
    }

    //Redirect to the submit page once finished.
    res.redirect('/submit');

  });

  });

  
const port = process.env.PORT || 3000;
app.listen(port, () => {
console.log(`Server is running on http://localhost:${port}`);
});
