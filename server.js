if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const IndexRouter = require('./routes/index');
const AuthorsRouter = require('./routes/authors');
const BodyParser = require('body-parser');

const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(BodyParser.urlencoded({
  limit: '10mb',
  extended: false
}));

console.log('database..', process.env.DATABASE_URL)
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log('Connected to mongoose'));

app.use('/', IndexRouter);
app.use('/authors', AuthorsRouter);

app.listen(process.env.PORT || 3000);
