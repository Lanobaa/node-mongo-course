const express = require('express');
const router = express.Router();
const Author = require('../models/author');
// all authors
router.get('/', async (req, res) => {
  const searchOptions = {};
  if (req.query.name != null && req.query.name !== '') {
    searchOptions.name = new RegExp(req.query.name, 'i');
  }
  try {
    const authors = await Author.find(searchOptions);
    res.render('authors/index', {
      authors: authors,
      searchOptions: req.query
    });
  } catch (e) {
    res.redirect('');
  }
});
// add new author
router.get('/new', (req, res) => {
  res.render('authors/new', {
    author: new Author()
  });
});
// post
router.post('/', async (req, res) => {
  console.log(req.body.name);
  const author = new Author({
    name: req.body.name
  });
  try {
    const newAuthor = await author.save();
    // res.redirect(`authors/${newAuthor.id}`);
    res.redirect('authors');
  } catch (err) {
    res.render('authors/new', {
      author: author,
      errorMessage: 'Error creating author'
    });
  }
});

module.exports = router;
