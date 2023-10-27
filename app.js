const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const nodemailer = require('nodemailer');
const passport = require('passport');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session'); // to maintain sessions for users through cookies.
require('./public/js/handler/auth-handler'); // requiring in the passport middleware into our app
const axios = require('axios');
const request = require('request');
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://dharan731:testhello123@cluster0.zeepkle.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
  uid: String,
  email: String,
});

const User = mongoose.model('User', userSchema);

const app = express();

app.use(session({secret:process.env.EXPRESS_SECRET}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());

const ejs = require('ejs');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());


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
app.get('/profile', async(req , res) => {
  const userProfile = req.user;
  const profilePicture = userProfile.photos[0].value;
  console.log(typeof profilePicture)
  const userId = req.user.id

  let name = ''
  let age = ''
  let email = ''
   
  User.findOne({ uid: userId }).then((data) => {
    console.log(data);
    res.render('profile', { profilePicture, userId: data.uid, name : data.name, email: data.email, age: data.age });
  }).catch((err) => {
    res.render('profile', { profilePicture, userId, name , email, age });
  });

  
});

// Signup page is served.
// app.get('/reports', (req, res) => {
//   res.sendFile(__dirname + '/views/reports.html');
// });


app.get("/reports", async(req, res) => {
  const response_message = {
   serverScore: req.query.score,
    serverDiagnosis: req.query.diagnosis
  };

  console.log(response_message);

    res.render("reports", {
      serverScore: response_message.serverScore,
      serverDiagnosis: response_message. serverDiagnosis,
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

// Define the /answers endpoint
app.post('/answers', (req, res) => {

  const response_message = {
    serverScore: req.query.score,
     serverDiagnosis: req.query.diagnosis
   };
  const answers = req.body; 
  console.log(req.body)
  // res.json({ message: 'Answers received and processed successfully' });
  console.log('The JSON Was posted to /answers')

  request.post('http://127.0.0.1:5000/model_input', { json: answers }, function (error, response, body) {
    if (error) {
      // console.error('Error:', error);
      res.send({error: error})
    } else {
      res.send(response)
      // res.render("reports", {
      
      //   serverScore: response_message.score,
      //   serverDiagnosis: response_message.diagnosis,
      // });
    }
  });
  

});

app.post('/results', (req, res) => {
  // Process the JSON data received from Flask
  const receivedData = req.body;
  console.log('JSON Recieved on this endpoint : /results')
  
  // Printing the recieved JSON file
  console.log(req.body)

});

app.post('/updateProfile', async (req, res) => {
  const { uid, name, age, email } = req.body;
  const user = req.user.id
  try {
    // Check if a user profile with the provided `uid` already exists
    const existingUser = await User.findOne({ uid: user });

    if (existingUser) {
      // If the profile exists, update it
      existingUser.name = name;
      existingUser.age = age;
      existingUser.email = email;
      const updatedUser = await existingUser.save();
      res.redirect('/profile');
    } else {
      // If the profile doesn't exist, create a new one
      const newUser = new User({ uid, name, age, email });
      const savedUser = await newUser.save();
      res.redirect('/profile');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not update or create the user profile' });
  }
});

app.get('/getProfile/:uid', async (req, res) => {
  const uid = req.params.uid;
  const user = req.user.id
  try {
    // Find the user profile with the provided `uid`
    const userProfile = await User.findOne({ uid: user });

    if (userProfile) {
      res.json({ message: 'User profile found', user: userProfile });
    } else {
      res.status(404).json({ error: 'User profile not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not retrieve the user profile' });
  }
});

// logout page is served.
app.get('/logout' , (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.session.destroy()
    res.redirect('/home');
  });
});

// FAQ page is served.
app.get('/faq', (req, res) => {
  res.sendFile(__dirname + '/views/faq.html');
});

  
const port = process.env.PORT || 3000;
app.listen(port, () => {
console.log(`Server is running on http://localhost:${port}`);
});
