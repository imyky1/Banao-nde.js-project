const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')//for hashing the password
const nodemailer = require('nodemailer');//to send mail when forgot password
const User = require('./models/User')
const jwt = require('jsonwebtoken')//assigning token to the logged in user
const { JWT_SECRET,SMTP_USER,SMTP_KEY } = require('./config/keys')


const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
        user: SMTP_USER,
        pass: SMTP_KEY
    }
});

//home page API
router.get("/", (req, res) => {
    res.send("Banao Node.js")
})

//Signup API
router.post('/signup', async (req, res) => {
    console.log(req.body)
    try {
        const { username, email, password } = req.body

        const founduser1 = await User.findOne({ email: email })
        if (founduser1) {
            return res.status(422).json({ error: "This email Already Exist" })
        }
        const founduser2 = await User.findOne({ username: username })
        if (founduser2) {
            return res.status(422).json({ error: "This username Already Exist" })
        }
        const hashedpassword = await bcrypt.hash(password, 12)
        const newUser = new User({
            username: username,
            email: email,
            password: hashedpassword
        })
        await newUser.save()
        res.json({ message: "saved successfully" })
    }
    catch (e) {
        res.json({ message: e.message })
    }
})

//Login API
router.post('/signin', async (req, res) => {
    try {
        const { username, password } = req.body
        const founduser = await User.findOne({ username })
        if (!founduser) {
            return res.status(422).json({ error: "Inavalid credentials" })
        }
        const validated = await bcrypt.compare(password, founduser.password)
        if (validated) {
            const { _id, username, email } = founduser
            const token = jwt.sign({ _id: founduser._id }, JWT_SECRET)
            res.json({ token: token, user: { _id, username, email } })
        }
        else {
            res.status(422).json({ error: "Invalid credentials" })
        }
    }
    catch (e) {
        res.status(422).json({ error: e.message })
    }
})

// Forgot Password API
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Generate reset token and set its expiry
        const resetToken = Math.random().toString(36).substr(2);
        //   const resetTokenExpiry = Date.now() + 3600000; // Token expires in 1 hour

        user.resetToken = resetToken;
        //   user.resetTokenExpiry = resetTokenExpiry;

        await user.save();

        const mailOptions = {
            from: 'Banao node.js yash.20465@knit.ac.in',
            to: email,
            subject: 'Password Reset',
            text: `Click the following link to reset your password: http://your-app/reset/${resetToken}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ error: 'Error sending email.' });
            }

            console.log('Email sent:', info.response);
            res.json({ message: 'Password reset instructions sent to your email.' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred.' });
    }
});

module.exports = router