var express = require('express');
var shortid = require('shortid');
var global = require('../global');
var models = require('../db/models');
var routeUtils = require('./routeUtils');
var router = express.Router();

router.get('/', function (req, res, next) {
    let dId = req.user ? req.user.dId : null;
    if (dId)
        res.redirect(`/user/${dId}`);
    else
        res.redirect('/');
});

router.get('/:id', async function (req, res, next) {
    let dId = req.user ? req.user.dId : null;
    let inGame = global.players[dId] ? global.players[dId].id : null;
    let user = await models.User.findOne({dId: req.params.id}).select('name');

    if (user)
        res.render('pages/user', {dId, inGame, user});
    else
        res.redirect('/');
});

router.get('/:id/profile', async function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    try {
        let dId = req.user ? req.user.dId : null;
        let inGame = global.players[req.params.id];
        let user = await models.User.findOne({dId: req.params.id})
            .select('dId name tag avatar wins losses bio banner setups games profileImg -_id')
            .populate({
                path: 'setups',
                select: 'id name closed count roles -_id',
                options: {
                    limit: 10
                }
            })
            .populate({
                path: 'games',
                select: 'id setup -_id',
                populate: {
                    path: 'setup',
                    select: 'id name closed roles total -_id'
                }
            });

        user = user.toObject();

        for (let game of user.games) {
            game.state = 'finished';

            if (game.setup.count) {
                let count = {};
                for (let [k, v] of game.setup.count) count[k] = v;
                game.setup.count = count;
            }
        }

        for (let setup of user.setups) {
            if (setup.count) {
                let count = {};
                for (let [k, v] of setup.count) count[k] = v;
                setup.count = count;
            }
        }

        if (inGame) {
            let game = {
                id: inGame.id,
                setup: {
                    id: inGame.setup.id,
                    name: inGame.setup.name,
                    closed: inGame.setup.closed,
                    count: inGame.setup.count,
                    roles: JSON.stringify(inGame.setup.roles),
                    total: inGame.setup.total
                },
                players: inGame.players.length,
                state: inGame.started ? 'inProgress' : 'open'
            };
            user.games.unshift(game);
        }

        res.send({user: user, self: dId});
    }
    catch (e) {
        console.error(e);
        res.send({error: 'Unable to load profile info'});
    }
});

router.get('/:id/info', async function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    try {
        let user = await models.User.findOne({dId: req.params.id})
            .select('name tag wins losses rankPoints profileImg -_id');
        if (user) {
            user = user.toObject();

            if (global.players[req.params.id])
                user.inGame = global.players[req.params.id].id;
            else
                user.inGame = 'No';

            res.send(user);
        }
        else
            res.send({error: 'Unable to find user'});
    }
    catch (e) {
        console.error(e);
        res.send({error: 'Unable to find user'});
    }
});

router.post('/bio', async function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    try {
        let dId = req.user ? req.user.dId : null;
        let bio = req.body.bio;

        if (dId && bio && bio.length < 1000) {
            await models.User.update({dId: dId}, {$set: {bio: bio}}).exec();
            res.send({success: true});
        }
        else if (bio.length >= 1000) {
            res.send({error: 'Bio must be less than 1000 characters'});
        }
        else {
            res.send({error: 'Unable to edit bio'});
        }
    }
    catch (e) {
        console.error(e);
        res.send({error: 'Unable to edit bio'});
    }
});

router.post('/banner', async function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    try {
        let dId = req.user ? req.user.dId : null;
        let banner = req.body.banner;

        if (banner.indexOf('http') == 0)
            banner.replace('http', 'https');

        if (dId && (banner.indexOf('https://i.imgur.com/') == 0 || banner.length == 0)) {
            await models.User.update({dId: dId}, {$set: {banner: banner}}).exec();
            res.send({success: true});
        }
        else if (banner.indexOf('http://i.imgur.com/') != 0) {
            res.send({error: 'Not a valid imgur url'});
        }
        else {
            res.send({error: 'Unable to update banner'});
        }
    }
    catch (e) {
        console.error(e);
        res.send({error: 'Unable to update banner'});
    }
});

router.post('/profileImgUpdate',async function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    try {
        let dId = req.user ? req.user.dId : null;
        let profileImg = req.body.imgUrl;
        if (dId) {
            await models.User.update({dId: dId}, {$set: {profileImg: profileImg}}).exec();
            res.send({success: true});
        }
    }
    catch (e) {
        console.error(e);
        res.send({error: 'Unable to update profile image'});
    }
})
module.exports = router;
