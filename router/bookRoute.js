const express = require('express')
const router = new express.Router();

const mongoose = require('mongoose');
const DB = process.env.DATABASE
require('../db/mongoose');

const User = require("../models/userSchema");
const Book = require("../models/bookSchema");

const { requiredAuth, checkUser } = require("../auth/authMiddleware.js")

// books 
router.get('/books', requiredAuth, checkUser, async (req, res) => {

    booksExist = await Book.find({})
    // console.log(booksExist.length)
    if (booksExist.length == 0) {
        for (let i = 0; i < 8; i++) {
            var book = new Book({ sem: i + 1 })
            await book.save();
        }
    }
    allBooks = await Book.find({})
    res.render('books', { allBooks, message: req.flash('message') });
})

// books 
router.get('/books/view/:bid', requiredAuth, checkUser, async (req, res) => {
    try {
        const book = await Book.findById({ _id: req.params.bid })
        res.render('bookview', { book, message: req.flash('message') })
    } catch (err) {
        console.log(err)
    }
})

// page edit
router.get('/books/page/edit/:bid', requiredAuth, checkUser, async (req, res) => {
    try {
        const book = await Book.findById({ _id: req.params.bid })

        res.render('pageedit', { book, message: req.flash('message') })
    } catch (err) {
        console.log(err)
    }
})

// page edit post
router.post('/books/page/post/:bid', requiredAuth, checkUser, async (req, res) => {
    try {
        const book = await Book.findById({ _id: req.params.bid })
        const editor = req.body.editor
        // console.log(editor)

        book.pages.push({
            content: editor
        })
        await book.save();
        res.redirect('/books/page/view/'+book._id+'/'+(book.pages[(book.pages.length - 1)]._id))
    } catch (err) {
        console.log(err)
    }
})

// page view
router.get('/books/page/view/:bid/:pid', requiredAuth, checkUser, async (req, res) => {
    try {
        const book = await Book.findById({ _id: req.params.bid })
        var page
        for (let i= 0; i < book.pages.length; i++) {
            if (book.pages[i]._id == req.params.pid) {
                page = book.pages[i];
                break;
            }
        }
        // console.log(page)
        res.render('pageview', { book, page, message: req.flash('message') })
    } catch (err) {
        console.log(err)
    }
})

module.exports = router