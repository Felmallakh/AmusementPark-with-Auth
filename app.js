
const express = require('express');
const path = require('path');
const morgan = require('morgan');

// We use the express-session library in order to set up session middleware
const session = require('express-session');
const cookieParser = require('cookie-parser');
const session = require("express-session");
const { restoreUser } = require("./auth")

const { environment, sessionSecret } = require('./config');

const indexRoutes = require('./routes');
const parkRoutes = require('./routes/park');
const attractionRoutes = require('./routes/attraction');
const userRoutes = require('./routes/user');
const visitRoutes = require('./routes/visit');

const app = express();

app.set('view engine', 'pug');
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

// We pass in the same secret to our cookieParser as we do to our session middleware
app.use(cookieParser(sessionSecret));

// Our session middleware sets up a name in order to easily identify the cookie that it creates
app.use(session({
  name: 'amusement-park-tracker.sid',
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
			httpOnly: true,
			maxAge: 60000,
			path: '/',
			secure: true
  }
}));
app.use(express.urlencoded({ extended: false }));

// We use our restoreUser middleware (defined in our auth file below) in order to add the whole user instance to our response's locals key, as well as a flag to indicate we have been authenticated. We can use these values in subsequent routes or middleware functions in order to restrict access, provide customized information, etc.
app.use(restoreUser)

app.use(indexRoutes);
app.use(parkRoutes);
app.use(attractionRoutes);
app.use(userRoutes);
app.use(visitRoutes);

// Catch unhandled requests and forward to error handler.
app.use((req, res, next) => {
  const err = new Error('The requested page couldn\'t be found.');
  console.log(req.path)
  err.status = 404;
  next(err);
});

// Custom error handlers.

// Error handler to log errors.
app.use((err, req, res, next) => {
  if (environment === 'production' || environment === 'test') {
    // TODO Log the error to the database.
  } else {
    console.error(err);
  }
  next(err);
});

// Error handler for 404 errors.
app.use((err, req, res, next) => {
  if (err.status === 404) {
    res.status(404);
    res.render('page-not-found', {
      title: 'Page Not Found',
    });
  } else {
    next(err);
  }
});

// Generic error handler.
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  const isProduction = environment === 'production';
  res.render('error', {
    title: 'Server Error',
    message: isProduction ? null : err.message,
    stack: isProduction ? null : err.stack,
  });
});

module.exports = app;
