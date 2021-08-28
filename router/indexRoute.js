const express = require('express')
const router = new express.Router();
const bcrypt = require('bcrypt');

const mongoose = require('mongoose');
const DB = process.env.DATABASE
require('../db/mongoose');

const User = require("../models/userSchema");
const Book = require("../models/bookSchema");

const { requiredAuth, checkUser } = require("../auth/authMiddleware.js")
const { createToken } = require('../auth/jwttoken.js')
const jwt = require('jsonwebtoken');

router.get('/', (req, res) => {
    res.redirect('/login');
})
router.get('/login', (req, res) => {
    res.render('login', { message: req.flash('message') });
})
router.get('/signup', (req, res) => {
    res.render('signup', { message: req.flash('message') });
})

// Signup
router.post('/signup', async (req, res) => {
    const { name, rollno, password, age } = req.body;
    // console.log(name)

    if (!name || !rollno || !password || !age) {
        req.flash('message', 'Please fill all the fields.')
        res.redirect('/signup')
        // return res.status(422).json({ error: "Please fill all the fields." })
    }

    try {
        const userExist = await User.findOne({ rollno: rollno })

        if (userExist) {
            req.flash('message', 'Email Already Exists')
            res.redirect('/signup')
            // return res.status(422).json({ error: "Email Already Exists" })
        } else {
            const user = new User({ name, rollno, password, age })

            const userRegistered = await user.save();

            if (userRegistered) {
                req.flash('message', 'User Registered Successfully')
                res.redirect('/login')
                // res.status(201).json({ message: "User Registered Successfully" });
            } else {
                req.flash('message', 'Failed to Register')
                res.redirect('/signup')
                // res.status(500).json({ error: "Failed to Register" })
            }
        }
    } catch (err) {
        console.log(err)
    }
})

//Login
router.post('/login', async (req, res) => {
    try {
        const { rollno, password } = req.body;

        if (!rollno || !password) {
            req.flash('message', 'Please fill all the fields')
            res.redirect('/login')
            // return res.status(400).json({ error: "Please fill all the fields" })
        }

        const userLogin = await User.findOne({ rollno: rollno });

        if (userLogin) {
            const isMatch = await bcrypt.compare(password, userLogin.password);
            if (!isMatch) {
                req.flash('message', 'Invalid Credentials')
                res.redirect('/login')
                // res.status(400).json({ error: "Invalid Credentials" })
            } else {
                // generating tokens 
                const token = createToken(userLogin._id);
                res.cookie('jwt', token, { httpOnly: true, maxAge: 2 * 24 * 60 * 60 * 1000})
                req.flash('message', 'Logged In Successfully')
                res.redirect('/dashboard')
            }
        } else {
            req.flash('message', 'Invalid Credentials')
            res.redirect('/login')
            // res.status(400).json({ error: "Invalid Credentials" })
        }
    } catch (err) {
        console.log(err)
    }
})

// dashboard
router.get('/dashboard', requiredAuth, checkUser, async (req, res) => {
    res.render('dashboard', { message: req.flash('message') });
})

// profile page
router.get('/profile', requiredAuth, checkUser, async (req, res) => {
    res.render('profile', { message: req.flash('message') });
})

// users data page
router.get('/users', requiredAuth, checkUser, async (req, res) => {
    const usersData = await User.find({})
    res.render('allusers', { usersData, message: req.flash('message') })
})

// logout 
router.get('/logout', async (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    req.flash('message', 'Logged Out Successfully')
    res.redirect('/login')
})

module.exports = router