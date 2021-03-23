var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var newsCategoriesRouter = require('./routes/news-categories');
var newsAuthorsRouter = require('./routes/news-authors');
var newsRouter = require('./routes/news');
var apiRouter = require('./routes/api');
var gendersRouter = require('./routes/genders');
var typesOfWorkRouter = require('./routes/types-of-work');
var levelsOfEducationRouter = require('./routes/levels-of-education');
var academicDegreeLevels = require('./routes/academic-degree-levels');
const jobNewsStatus = require('./routes/job-news-status');
const jobSkills = require('./routes/job-skills');
const jobTitles = require('./routes/job-titles');
const jobNews = require('./routes/job-news');

var logger = require('morgan');

const _ = require('lodash');
const fileUpload = require('express-fileupload');
const cors = require('cors');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//giúp các request truy cập được các file trong thư mục upload
app.use(express.static(path.join(__dirname, 'uploads')));

app.use(fileUpload({
  createParentPath: true
}));
app.use(cors());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/news-categories', newsCategoriesRouter);
app.use('/news-authors', newsAuthorsRouter);
app.use('/news', newsRouter);
app.use('/api', apiRouter);
app.use('/genders', gendersRouter);
app.use('/types-of-work', typesOfWorkRouter);
app.use('/levels-of-education', levelsOfEducationRouter);
app.use('/academic-degree-levels', academicDegreeLevels);
app.use('/job-news-status', jobNewsStatus);
app.use('/job-skills', jobSkills);
app.use('/job-titles', jobTitles);
app.use('/job-news', jobNews);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

