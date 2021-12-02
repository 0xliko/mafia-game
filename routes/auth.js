var express = require('express');
var passport = require('../discordPassport');
var router = express.Router();

router.get('/', passport.authenticate('discord', {scope: 'identify'}));

router.get('/redirect', passport.authenticate('discord', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

module.exports = router;
