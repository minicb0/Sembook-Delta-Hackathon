const express = require('express')
const router = new express.Router();

const mongoose = require('mongoose');
const DB = process.env.DATABASE
require('../db/mongoose');

const User = require("../models/userSchema");

const { requiredAuth, checkUser } = require("../auth/authMiddleware.js")

// books 
router.get('/books', requiredAuth, checkUser, async (req, res) => {
    res.render('books', { message: req.flash('message') });
})

module.exports = router