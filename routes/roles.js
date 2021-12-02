var express = require('express');
var shortid = require('shortid');
var global = require('../global');
var models = require('../db/models');
var routeUtils = require('./routeUtils');
var router = express.Router();

router.get('/', async function (req, res, next) {
    try {
        let dId = req.user ? req.user.dId : null;
        let roles = await models.Role.find();
        let inGame = global.players[dId] ? global.players[dId].id : null;

        if (req.query.edit) {
            let setup = await models.Setup.findOne({id: String(req.query.edit)})
                .select('id name creator closed unique roles count startState whispers leakPercentage lastWill')
                .populate('creator', 'dId');
            setup = setup.creator.dId == dId ? setup : {};
            res.render('pages/roles', {dId: dId, roles: roles, setup: setup, inGame: inGame});
        }
        else
            res.render('pages/roles', {dId: dId, roles: roles, setup: {}, inGame: inGame});
    }
    catch (e) {
        console.error(e);
        try {
            res.redirect('/');
        } catch (e) {}
    }
});

router.get('/:name', async function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    try {
        let role = await models.Role.findOne({name: req.params.name})
            .select('-_id -__v');
        if (role)
            res.send(role);
        else
            res.send({error: 'Unable to find role'});
    }
    catch (e) {
        console.error(e);
        res.send({error: 'Unable to find role'});
    }
});

module.exports = router;
