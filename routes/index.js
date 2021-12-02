var express = require('express');
var global = require('../global');
var models = require('../db/models');
var routeUtils = require('./routeUtils');
var router = express.Router();

router.get('/', async function(req, res, next) {
    console.log(req.user)
    try {
        let banned, inGame, dId = req.user ? req.user.dId : null;
        if (dId) {
            banned = await routeUtils.checkBan(dId);
            inGame = global.players[dId] ? global.players[dId].id : null;
        }
        res.render('pages/index', {dId: dId, inGame: inGame, banned: banned, nextRestart: 1536463127948});
    }
    catch (e) {
        console.error(e);
        res.render('pages/500', {dId: req.user ? req.user.dId : null});
    }
});

router.get('/login', function(req, res, next) {
    try {
        if (req.user && req.user.dId)
            res.redirect('/');
        else {
            req.session.ref = req.query.ref;
            res.render('pages/login');
        }
    }
    catch (e) {
        console.error(e);
        try {
            res.render('pages/500', {dId: req.user ? req.user.dId : null});
        }
        catch (e) {};
    }
});

router.get('/logout', function(req, res, next) {
    try {
        req.logout();
        res.redirect('/login');
    }
    catch (e) {
        console.error(e);
        res.render('pages/500', {dId: req.user ? req.user.dId : null});
    }
});

router.get('/bot', function (req, res, next) {
    try {
        res.render('pages/bot', {dId: req.user ? req.user.dId : null});
    }
    catch (e) {
        console.error(e);
        res.render('pages/500', {dId: req.user ? req.user.dId : null});
    }
});

router.get('/nextRestart', function (req, res, next) {
    try {
        if (global.restart != null)
            res.send(String(global.restart));
        else
            res.send('-1');
    }
    catch (e) {
        console.error(e);
        res.send('-1');
    }
});

module.exports = router;
