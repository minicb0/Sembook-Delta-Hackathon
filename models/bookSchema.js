const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    bookName: {
        type: String
    },
    sem: {
        type: Number,
        required: true
    },
    totalPages: {
        type: Number
    },
    pages: [{
        content: String
    }]
});

const Book = mongoose.model("BOOK", bookSchema);

module.exports = Book;