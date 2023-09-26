const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const nodemailer = require('nodemailer');

dotenv.config();

app.use(express.static(__dirname + '/public')); 
app.use(express.urlencoded({ extended: true }));

app.get('/home', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/contact', (req, res) => {
  res.sendFile(__dirname + '/views/contact.html');
});

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
        res.send('Email sent successfully');
      }
    });
    
  });
  
const port = process.env.PORT || 3000;
app.listen(port, () => {
console.log(`Server is running on http://localhost:${port}`);
});
