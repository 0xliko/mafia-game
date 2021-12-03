var dotenv = require('dotenv').config({ path: "./.env" });
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var passport = require('passport');
var fs = require('fs');
var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var gameRouter = require('./routes/game');
var roleRouter = require('./routes/roles');
var userRouter = require('./routes/user');


var session = require('./session');

var app = express();
var stream = fs.createWriteStream(path.join(__dirname, 'bin/logs/requests.txt'), {flags: 'a'});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//if (process.env.NODE_ENV == 'development')
app.use(logger('dev', {stream: stream}));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session);
if(process.env.NODE_ENV=="development") {
    app.use(express.static(path.join(__dirname, 'public'), {maxAge: 3600}));
}
else{
    app.use("/javascript", express.static(path.join(__dirname, 'build', 'javascript'),{maxAge: 3600}));
    app.use("/wallet-connect", express.static(path.join(__dirname, 'build', 'wallet-connect'),{maxAge: 3600}));
    app.use("/images", express.static(path.join(__dirname, 'public', 'images'),{maxAge: 3600}));
    app.use("/audio", express.static(path.join(__dirname, 'public', 'audio'),{maxAge: 3600}));
    app.use("/stylesheets", express.static(path.join(__dirname, 'public', 'stylesheets'),{maxAge: 3600}));
    app.use("/fonts", express.static(path.join(__dirname, 'public', 'fonts'),{maxAge: 3600}));
}

app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/game', gameRouter);
app.use('/roles', roleRouter);
app.use('/user', userRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    if (err.status == 404)
        res.render('pages/404', {dId: req.user ? req.user.dId : null});
    else {
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') == 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('pages/500', {dId: req.user ? req.user.dId : null, error: req.app.get('env') == 'development' ? err : ''});
    }
});

module.exports = app;
