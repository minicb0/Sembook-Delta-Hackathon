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
        content: String,
        viewAccess: [mongoose.Schema.Types.ObjectId],
        editAccess: [mongoose.Schema.Types.ObjectId],
        noAccess: [mongoose.Schema.Types.ObjectId]
    }]
});

const Book = mongoose.model("BOOK", bookSchema);

module.exports = Book;