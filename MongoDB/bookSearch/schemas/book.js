const mongoose = require("mongoose");

const { Schema } = mongoose;

const bookSchema = new Schema({
  authors: {
    type: Array,
  },
  contents: {
    type: String,
  },
  publishedDate: {
    type: Date,
  },
  isbn: {
    type: String,
    unique: true,
  },
  price: {
    type: Number,
  },
  publisher: {
    type: String,
  },
  sale_price: {
    type: Number,
  },
  status: {
    type: String,
  },
  thumbnail: {
    type: String,
  },
  title: {
    type: String,
  },
  translators: {
    type: String,
  },
  url: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Book", bookSchema);
