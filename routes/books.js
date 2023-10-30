const express = require('express');
const router = express.Router();
const Books = require('../models/books');
const Author = require('../models/author');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

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
    res.render('books/index', {
      books: books,
      searchOptions: req.query
    });
  } catch (err) {
    res.redirect('/');
  }
});
// new book route
router.get('/new', async (req, res) => {
  await renderNewPage(res, new Books());
});
// create book route
router.post('/', async (req, res) => {
  const book = new Books({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description,
  });

  saveCover(book, req.body.cover);

  try {
    const newBook = await book.save();
    res.redirect(`books/${newBook.id}`);
  } catch (err) {
    await renderNewPage(res, book, true);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const book = await Books.findById(req.params.id).populate('author').exec();
    res.render('books/show', { book: book });
  } catch (e) {
    res.redirect('/');
  }
});

router.get('/:id/edit', async (req, res) => {
  try {
    const book = await Books.findById(req.params.id);
    renderEditPage(res, book);
  } catch (e) {
    res.redirect('/');
  }
});

router.put('/:id', async (req, res) => {
  let book;
  try {
    book = await Books.findById(req.params.id);
    book.title = req.body.title;
    book.author = req.body.author;
    book.publishDate = new Date(req.body.publishDate);
    book.pageCount = req.body.pageCount;
    book.description = req.body.description;
    if (req.body.cover != null && req.body.cover !== '') {
      saveCover(book, req.body.cover);
    }
    await book.save();
    res.redirect(`/books/${book.id}`);
  } catch (err) {
    if (book != null) {
      await renderEditPage(res, book, true);
    } else {
      res.redirect('/');
    }
  }
});

router.delete('/:id', async (req, res) => {
  let book;
  try {
    book = await Books.findById(req.params.id);
    await book.deleteOne();
    res.redirect('/books');
  } catch (e) {
    if (book != null) {
      res.render('books/show', {
        book: book,
        errorMessage: 'Could not removve book'
      });
    } else {
      res.redirect('/');
    }
  }
})

async function renderNewPage(res, book, hasError = false) {
  await renderFormPage(res, book, 'new', hasError);
}

async function renderEditPage(res, book, hasError = false) {
  await renderFormPage(res, book, 'edit', hasError);
}
async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book,
    };
    if (hasError) {
      if (form === 'edit') {
        params.errorMessage = 'Error Updating Book';
      } else {
        params.errorMessage = 'Error creating Book';
      }
    }
    res.render(`books/${form}`, params);
  } catch (err)  {
    res.redirect('/books');
  }
}

function saveCover(book, coverEncoded) {
  if (coverEncoded == null) return;
  const cover = JSON.parse(coverEncoded);
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, 'base64');
    book.coverImageType = cover.type;
  }
}

module.exports = router;
