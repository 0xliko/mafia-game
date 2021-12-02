var mongoose = require('mongoose');

mongoose.connect(`${process.env.MONGO_URL}`, {
    user: process.env.MONGO_USER,
    pass: process.env.MONGO_PW,
    useNewUrlParser: true
});
var db = mongoose.connection;

module.exports = db;
