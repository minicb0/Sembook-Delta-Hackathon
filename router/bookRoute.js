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
router.post('/books/page/post/:uid/:bid', requiredAuth, checkUser, async (req, res) => {
    try {
        const book = await Book.findById({ _id: req.params.bid })
        const user = await User.findById({ _id: req.params.uid })
        const allUsers = await User.find({})
        const editor = req.body.editor
        // console.log(editor)
        // console.log(user)

        var noAccessUsers = [];

        // no access users
        for (let i = 0; i < allUsers.length; i++) {
            if (user._id.toString() != allUsers[i]._id.toString()) {
                noAccessUsers.push(allUsers[i]._id)
            }
        }
        // console.log(noAccessUsers)
        book.pages.push({
            content: editor,
            editAccess: [user._id],
            noAccess: noAccessUsers
        })
        await book.save();
        res.redirect('/books/page/view/'+user._id+'/'+book._id+'/'+(book.pages[(book.pages.length - 1)]._id))
    } catch (err) {
        console.log(err)
    }
})

// page view
router.get('/books/page/view/:uid/:bid/:pid', requiredAuth, checkUser, async (req, res) => {
    try {
        const book = await Book.findById({ _id: req.params.bid })
        const user = await Book.findById({ _id: req.params.uid })
        var page
        for (let i= 0; i < book.pages.length; i++) {
            if (book.pages[i]._id == req.params.pid) {
                page = book.pages[i];
                break;
            }
        }
        // console.log(page)

        // access button
        var access = false
        for (let i= 0; i < page.editAccess.length; i++) {
            if (page.editAccess[i].toString() == req.params.uid) {
                access = true
                break;
            }
        }
        console.log(page.editAccess)
        console.log(access)
        res.render('pageview', { access, book, page, message: req.flash('message') })
    } catch (err) {
        console.log(err)
    }
})

// page edit perms
router.get('/books/page/perms/:uid/:bid/:pid', requiredAuth, checkUser, async (req, res) => {
    try {
        const book = await Book.findById({ _id: req.params.bid })
        const user = await User.findById({ _id: req.params.uid })

        // page
        var page
        for (let i= 0; i < book.pages.length; i++) {
            if (book.pages[i]._id == req.params.pid) {
                page = book.pages[i];
                break;
            }
        }
        var editUsers = [];
        var viewUsers = [];
        var noAccessUsers = [];
        // perm users
        for (let i= 0; i < page.editAccess.length; i++) {
            let user = await User.findById({ _id: page.editAccess[i] })
            editUsers.push(user)
        }
        for (let i= 0; i < page.viewAccess.length; i++) {
            let user = await User.findById({ _id: page.viewAccess[i] })
            viewUsers.push(user)
        }
        for (let i= 0; i < page.noAccess.length; i++) {
            let user = await User.findById({ _id: page.noAccess[i] })
            noAccessUsers.push(user)
        }

        res.render('editperm', { book, user, page, editUsers, viewUsers, noAccessUsers, message: req.flash('message') })
    } catch (err) {
        console.log(err)
    }
})

// giving perms
router.get('/books/page/makeview/:uid/:bid/:pid/:userid', requiredAuth, checkUser, async (req, res) => {
    try {
        const book = await Book.findById({ _id: req.params.bid })
        const user = await User.findById({ _id: req.params.uid })

        // page
        var page
        for (let i= 0; i < book.pages.length; i++) {
            if (book.pages[i]._id == req.params.pid) {
                page = book.pages[i];
                var noAccessUser = page.noAccess.find((ele, index) => {
                    ele = req.params.userid
                    page.noAccess.splice[index, 1]
                    page.viewAccess.push(req.params.userid)
                })
                // console.log(noAccessUser)
                book.pages[i] = page
                book.save();
                break;
            }
        }
        res.redirect('/books/page/perms/'+user._id+'/'+book._id+'/'+page._id)
    } catch (err) {
        console.log(err)
    }
})

// giving perms -admin
router.get('/books/page/makeadmin/:uid/:bid/:pid/:userid', requiredAuth, checkUser, async (req, res) => {
    try {
        const book = await Book.findById({ _id: req.params.bid })
        const user = await User.findById({ _id: req.params.uid })

        // page
        var page
        for (let i= 0; i < book.pages.length; i++) {
            if (book.pages[i]._id == req.params.pid) {
                page = book.pages[i];
                page.viewAccess.find((ele, index) => {
                    ele = req.params.userid
                    page.viewAccess.splice[index, 1]
                    page.editAccess.push(req.params.userid)
                })
                // console.log(noAccessUser)
                book.pages[i] = page
                book.save();
                break;
            }
        }
        res.redirect('/books/page/perms/'+user._id+'/'+book._id+'/'+page._id)
    } catch (err) {
        console.log(err)
    }
})

module.exports = router