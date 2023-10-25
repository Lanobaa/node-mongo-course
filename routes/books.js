const express = require('express');
const multer = require('multer');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Books = require('../models/books');
const uploadPath = path.join('public', Books.coverImageBasePath);
const Author = require('../models/author');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, cb) => {
    console.log('file.name..', file);
    cb(null, imageMimeTypes.includes(file.mimetype));
  }
});
// all books route
router.get('/', async (req, res) => {
  let query = Books.find();
  if (req.query.title != null && req.query.title != '') {
    query.regex('title', new RegExp(req.query.title, 'i'));
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
    query = query.lte('publishDate', req.query.publishedBefore);
  }

  if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
    query = query.gte('publishDate', req.query.publishedAfter);
  }
  try {
    const books = await query.exec();
    console.log('books...', books);
    res.render('books/index', {
      books: books,
      searchOptions: req.query
    });
  } catch (err) {
    console.log('err.s..e..', err);
    res.redirect('/');
  }
});
// new book route
router.get('/new', async (req, res) => {
  await renderNewPage(res, new Books());
});
// create book route
router.post('/', upload.single('cover'), async (req, res) => {
  console.log('file.req...', req.file);
  console.log('file-.body...', req.body);
  const fileName = req.file != null ? req.file.filename: null;
  const book = new Books({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description,
    coverImageName: fileName,
  });

  try {
    console.log('book...', book);
    const newBook = await book.save();
    // res.redirect(`books/${newBook.id}`);
    res.redirect('books');
  } catch (err) {
    if (book.coverImageName != null) {
      removeBookCover(book.coverImageName)
    }
    await renderNewPage(res, book, true);
  }
});
function removeBookCover(fileName) {
  fs.unlink(path.join(uploadPath, fileName), err => {
    if (err) console.error(err);
  })
}

async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book,
    };
    if (hasError) params.errorMessage = 'Error creating Book';
    res.render('books/new', params);
  } catch (err)  {
    res.redirect('/books');
  }
}

module.exports = router;
