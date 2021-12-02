var expressSession = require('express-session');
var mongoStore = require('connect-mongo')(expressSession);
var db = require('./db/db.js');

module.exports = expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        path: '/',
        httpOnly: true,
        maxAge: 14 * 24 * 60 * 60 * 1000,
        secure: false
    },
    store: new mongoStore({
		mongooseConnection: db,
		ttl: 14 * 24 * 60 * 60,
		touchAfter: 24 * 60 * 60
	})
});
