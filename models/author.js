const mongoose = require('mongoose');
const Books = require('./books');
const AuthorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});


AuthorSchema.pre('deleteOne',  { document: true }, async function(next) {
  let books = await Books.find({ author: this.id });
  try {
    if (books.length > 0) {
      next(new Error('this author has books still'));
    } else {
      next();
    }
  } catch(e) {
    next(e);
  }
})
module.exports = mongoose.model('Author', AuthorSchema);
