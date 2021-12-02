var express = require('express');
var shortid = require('shortid');
var oHash = require('object-hash');
var global = require('../global');
var models = require('../db/models');
var routeUtils = require('./routeUtils');
var Game = require('../game/core/game.js');
var User = require('../game/core/user.js');
var alignmentMap = require('../game/groups/alignments');
var router = express.Router();
var mongoose = require('mongoose');
router.get('/host', async function (req, res, next) {
    try {
        let dId = req.user ? req.user.dId : null;
        let inGame = global.players[dId] ? global.players[dId].id : null;
        let user, favorites;

        if (dId) {
            user = await models.User.findOne({dId: dId})
                .select('favSetups')
                .populate('favSetups', 'id -_id');
            if (user) {
                favorites = user.favSetups.map(s => s.id);
            }
        }

        res.render('pages/hostGame', {dId: dId, inGame: inGame, favorites: favorites});
    } catch (e) {
        console.error(e);
        try {
            res.redirect('/');
        } catch (e) {
        }
    }
});

router.post('/leave', async function (req, res, next) {
    try {
        let dId = await routeUtils.verifyLoggedIn(req, res, false);
        let game = global.players[dId];

        if (game) {
            game.playerLeave(dId);
            delete global.players[dId];
            res.send('1');
        } else
            res.send('0');
    } catch (e) {
        console.error(e);
        res.send('0');
    }
});

router.get('/list', async function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    try {
        let step = Number(process.env.PAGE_STEP);
        let pageLimit = 20;
        let start = ((Number(req.query.page) || 1) - 1) * step;

        if (req.query.status == 'active') {


            let open_games = global.games["open"].slice().concat(global.games["private"].slice());
            let progress_games = global.games["inProgress"].slice();

            open_games = open_games.sort((a, b) => {
                return routeUtils.scoreGame(b) - routeUtils.scoreGame(a);
            });
            progress_games = progress_games.sort((a, b) => b.startTime - a.startTime);

            open_games.forEach(game => game.status = 'open')
            progress_games.forEach(game => game.status = 'progress')
            let games = open_games.concat(progress_games);

            games = games.map(game => {
                return {
                    id: game.id,
                    setup: {
                        name: game.setup.name,
                        id: game.setup.id,
                        roles: JSON.stringify(game.setup.roles),
                        closed: game.setup.closed,
                        count: !game.setup.closed ? {} : {
                            village: game.setup.count.get('village'),
                            mafia: game.setup.count.get('mafia'),
                            monsters: game.setup.count.get('monsters'),
                            independent: game.setup.count.get('independent'),
                        },
                        total: game.setup.total
                    },
                    status: game.status,
                    players: game.players.length
                };
            });

            res.send({games: games, pages: Math.ceil(games.length / step)})
        } else {
            let games = await models.Game.find()
                .sort('-_id')
                .limit(step * pageLimit)
                .select('id setup ranked stateLengths')
                .populate('setup', 'id name roles closed count total -_id');
            let count = games.length;
            res.send({games: games.slice(start, start + step), pages: Math.ceil(count / step)});
        }
    } catch (e) {
        console.error(e);
        res.send({games: [], pages: 1});
    }
});

router.get('/:id', async function (req, res, next) {
    try {
        let dId = await routeUtils.verifyLoggedIn(req, res, req.originalUrl);
        let banned = await routeUtils.checkBan(dId);
        if (!banned)
            res.render('pages/game', {
                gameId: req.params.id,
                socketUrl: process.env.SOCKET_URL,
                isTest: req.query.test
            });
        else
            res.redirect('/');
    } catch (e) {
        console.error(e);
        try {
            res.redirect('/');
        } catch (e) {
        }
    }
});

router.get('/:id/review', async function (req, res, next) {
    try {
        let game = await models.Game.findOne({id: req.params.id})
            .populate('setup')
            .populate('players', 'dId avatar tag profileImg -_id');
        if (game) {
            let dId = req.user ? req.user.dId : null;
            let inGame = global.players[dId] ? global.players[dId].id : null;
            res.render('pages/review', {dId: dId, game: game, inGame: inGame});
        } else
            res.redirect('/');
    } catch (e) {
        console.error(e);
        try {
            res.redirect('/');
        } catch (e) {
        }
    }
});

router.get('/:id/info', async function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    try {
        let game = await models.Game.findOne({id: req.params.id})
            .select('players stateLengths timeStart timeEnd -_id')
            .populate('players', 'dId name tag avatar -_id');
        if (game) {
            res.send(game);
        } else {
            let foundGame = false;
            let gameList = global.games.open.concat(global.games.inProgress);

            for (let game of gameList) {
                if (game.id == req.params.id) {
                    foundGame = true;
                    res.send({
                        players: game.players.map(player => {
                            return {
                                dId: player.user.id,
                                name: player.user.name,
                                avatar: player.user.avatar,
                                tag: player.user.tag
                            };
                        }),
                        stateLengths: {
                            day: game.getState('day').length,
                            night: game.getState('night').length
                        },
                        createTime: game.createTime,
                        ranked: game.ranked
                    });
                }
            }

            if (!foundGame)
                res.send({error: 'Game not found'});
        }
    } catch (e) {
        console.error(e);
        res.send({error: 'Game not found'});
    }
});

router.post('/create', async function (req, res, next) {
    let dId;
    try {
        res.setHeader('Content-Type', 'application/json');
        dId = await routeUtils.verifyLoggedIn(req, res, false);

        let stateLengths = {
            day: Number(req.body.stateLengths.day) * 60 * 1000,
            night: Number(req.body.stateLengths.night) * 60 * 1000
        };
        let existingGame = global.players[dId];
        let alreadyCreating = global.gameCreators[dId];

        if (
            !existingGame &&
            !alreadyCreating &&
            req.body.setup &&
            stateLengths.day >= 60000 &&
            stateLengths.day <= 600000 &&
            stateLengths.night >= 60000 &&
            stateLengths.night <= 600000
        ) {
            global.gameCreators[dId] = true;
            let setup = await models.Setup.findOne({id: req.body.setup});

            if (setup && (!req.body.ranked || req.body.ranked && setup.featured)) {
                let user = await models.User.findOne({dId: dId});
                let banned = await routeUtils.checkBan(dId);

                if (!banned) {
                    setup = setup.toObject();
                    user = new User(user, null);
                    setup.roles = JSON.parse(setup.roles);
                    setup.stateLengths = [
                        {name: 'day', length: stateLengths.day},
                        {name: 'night', length: stateLengths.night},
                    ];

                    let emojis = await models.Emoji.find({server: true}).select('-_id -__v');
                    let game = new Game(setup, req.body.private, req.body.ranked, emojis);
                    game.playerJoin(user, true);
                    delete global.gameCreators[dId];
                    res.send({game: game.id});
                } else {
                    delete global.gameCreators[dId];
                    res.send({error: 'You are currently banned from playing games'});
                }
            } else if (setup) {
                res.send({error: 'You can only play featured setups in ranked'});
                delete global.gameCreators[dId];
            } else {
                res.send({error: 'Setup not found'});
                delete global.gameCreators[dId];
            }
        } else if (existingGame)
            res.send({error: 'You must leave your other game before creating a new one'});
        else if (!req.body.setup)
            res.send({error: 'Please select a setup'});
        else
            res.send({error: 'Day and night must be between 1 and 10 minutes'});
    } catch (e) {
        console.error(e);
        res.send({error: 'Error creating setup'});
        if (dId)
            delete global.gameCreators[dId];
    }
});
router.post('/manage', async function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    if (req.headers.authorization != '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') {
        res.send({error: 'Invalid authorization'});
        return;
    }

    try {
        let setups = Object(req.body).data;
        let message = '';
        const createGameIDS = [];
        for(let i = 0; i < setups.length ; i ++)
        {
            let setup = setups[i];
            /// always set mustAct as false
            setup.mustAct = false;
            let roles = Object(setup.roles);
            let count = Object(setup.count);
            let total, hash, create = false;
            let alignments = ['village', 'mafia', 'monsters', 'independent'];
            if (roles && setup.name.length) {
                let officialRoles = await models.Role.find();
                let officialRoleNames = officialRoles.map(role => role.name);
                let disabledRoles = officialRoles.filter(role => role.disabled).map(role => role.name);

                if (setup.closed) { //Closed role setups
                    create = true;

                    count.village = Number(count.village);
                    count.mafia = Number(count.mafia);
                    count.monsters = Number(count.monsters);
                    count.independent = Number(count.independent);

                    roles.village = roles.village || [];
                    roles.mafia = roles.mafia || [];
                    roles.monsters = roles.monsters || [];
                    roles.independent = roles.independent || [];

                    //Check that all roles are valid roles
                    for (let alignment in roles) {
                        if (create) {
                            for (let role of roles[alignment]) {
                                if (
                                    officialRoleNames.indexOf(role) == -1 ||
                                    alignments.indexOf(alignment) == -1 ||
                                    disabledRoles.indexOf(role) != -1
                                ) {
                                    create = false;
                                    res.send({error: 'Invalid role names'});
                                    break;
                                }
                            }
                        } else
                            break;
                    }

                    //check that alignments have roles
                    if (create) {
                        if (
                            count.village > 0 && !roles.village.length ||
                            count.mafia > 0 && !roles.mafia.length ||
                            count.monsters > 0 && !roles.monsters.length ||
                            count.independent > 0 && !roles.independent.length
                        ) {
                            create = false;
                            res.send({error: 'You must choose roles for your chosen alignments'});
                        }
                    }
                } else if (Array.isArray(roles)) { //Open role setups
                    create = true;

                    for (let roleset of roles) {
                        if (create) {
                            //Check that all roles are valid roles
                            for (let role in roleset) {
                                if (officialRoleNames.indexOf(role) == -1) {
                                    create = false;
                                    res.send({error: 'Invalid role names'});
                                    break;
                                }
                            }

                            if (create) {
                                let tempCount = {
                                    village: 0,
                                    mafia: 0,
                                    monsters: 0,
                                    independent: 0
                                };

                                //Count up role alignments
                                for (let role in roleset) {
                                    if (roleset[role] >= 0) {
                                        for (let officialRole of officialRoles) {
                                            if (officialRole.name == role) {
                                                tempCount[officialRole.alignment] += Number(roleset[role]);
                                                break;
                                            }
                                        }
                                    } else {
                                        create = false;
                                        res.send({error: 'Role counts cannot be negative'});
                                        break;
                                    }
                                }

                                if (roles.indexOf(roleset) != 0) {
                                    if (
                                        tempCount.village != count.village ||
                                        tempCount.mafia != count.mafia ||
                                        tempCount.monsters != count.monsters ||
                                        tempCount.independent != count.independent
                                    ) {
                                        create = false;
                                        res.send({error: 'All rolesets must be the same length'});
                                        break;
                                    }
                                } else
                                    count = tempCount;
                            }

                            if (create) {
                                let tempRoleset = {};
                                Object.keys(roleset)
                                    .sort((a, b) => {
                                        let alignA = alignmentMap[a];
                                        let alignB = alignmentMap[b];
                                        if (alignA != alignB) {
                                            return alignments.indexOf(alignA) - alignments.indexOf(alignB);
                                        } else
                                            return a < b ? -1 : 1;
                                    })
                                    .forEach(roleName => {
                                        tempRoleset[roleName] = roleset[roleName];
                                        delete roleset[roleName];
                                        roleset[roleName] = tempRoleset[roleName];
                                    });
                            }
                        } else
                            break;
                    }
                }

                //Check for alignment counts
                if (create) {
                    if (count.village >= 0 && count.mafia >= 0 && count.monsters >= 0 && count.independent >= 0) {
                        if (
                            count.village + count.independent + count.monsters > count.mafia &&
                            count.village + count.independent + count.mafia > count.monsters
                        ) {
                            if (!count.mafia && !count.independent && !count.monsters) {
                                create = false;
                                res.send({error: 'You must have at least one mafia, monster, or independent  role'});
                            }
                        } else {
                            create = false;
                            res.send({error: 'Mafia and monsters must each make up less than half of the roles'});
                        }
                    } else {
                        create = false;
                        res.send({error: 'Role counts cannot be negative'});
                    }
                }

                //Check total
                if (create) {
                    total = count.village + count.mafia + count.monsters + count.independent;
                    if (total < 3 || total > 50) {
                        create = false;
                        res.send({error: 'Player count must be at least 3 and at most 50'});
                    }
                }

                //Check whisper leak rate
                if (create && setup.whispers) {
                    if (setup.leakPercentage < 0 || setup.leakPercentage > 100) {
                        create = false;
                        res.send({error: 'Leak percentage must be between 0% and 100%'});
                    }
                }

                //Check starting state
                if (create) {
                    if (setup.startState != 'day' && setup.startState != 'night') {
                        create = false;
                        res.send({error: 'Starting state must be day or night'});
                    }
                }

                //Sort roles alphabetically, verify unique hash and save
                if (create) {
                    let hash = oHash({
                        closed: Boolean(setup.closed),
                        unique: Boolean(setup.unique),
                        roles: JSON.stringify(roles),
                        count: JSON.stringify(setup.count),
                        startState: String(setup.startState),
                        whispers: Boolean(setup.whispers),
                        leakPercentage: setup.whispers ? Number(setup.leakPercentage) : 0,
                        lastWill: Boolean(setup.lastWill)
                    });

                    let existingSetup = await models.Setup.findOne({hash: hash});

                    if (existingSetup) {
                        setup.id = existingSetup.id;
                        setup._id = existingSetup._id;
                        console.log("same setup is already exist")
                    }
                    if (!existingSetup) {
                        var id = shortid.generate();
                        let setupItem = new models.Setup({
                            id: id,
                            hash: hash,
                            name: String(setup.name),
                            creator: "123456789123",
                            closed: Boolean(setup.closed),
                            unique: Boolean(setup.unique),
                            roles: JSON.stringify(roles),
                            count: setup.count,
                            total: total,
                            startState: String(setup.startState),
                            whispers: Boolean(setup.whispers),
                            mustAct: Boolean(setup.mustAct),
                            noReveal: Boolean(setup.noReveal),
                            leakPercentage: Number(setup.leakPercentage),
                            lastWill: Boolean(setup.lastWill)
                        });
                        await setupItem.save();
                        setup.id = id;
                        setup._id = setupItem._id;
                    }

                    // await models.User.update({dId: dId}, {$push: {setups: setup._id}}).exec();
                    console.log("game was setup")
                    setup.total = total;
                    setup.hash = hash;
                    setup.creator = "123456789123";
                    let stateLengths = {
                        day: Number(setup.stateLengths.day) * 60 * 1000,
                        night: Number(setup.stateLengths.night) * 60 * 1000
                    };
                    if (
                        stateLengths.day >= 60000 &&
                        stateLengths.day <= 600000 &&
                        stateLengths.night >= 60000 &&
                        stateLengths.night <= 600000
                    ) {
                        setup.stateLengths = [
                            {name: 'day', length: stateLengths.day},
                            {name: 'night', length: stateLengths.night},
                        ];
                        let emojis = await models.Emoji.find({server: true}).select('-_id -__v');
                        let uuid = oHash({
                            hash: setup.hash,
                            day: stateLengths.day,
                            night: stateLengths.night,
                            private: setup.private,
                            ranked:setup.ranked
                        });
                        if(global.games.open.findIndex(preGame=>{
                            return preGame.uuid == uuid;
                        }) == -1){
                            let game = new Game(setup, setup.private,setup.ranked, emojis,uuid);
                            createGameIDS.push(game.id);
                            console.log(`Created Game ${game.id}`)
                        }
                        // res.send({error: 'You must manage games here'});
                    }
                } else if (!setup.name.length) {
                    res.send({error: `You must give your ${i+1}-th game setting name`});
                    return;
                }
                else {
                    res.send({error: `${i+1}-th game role data invalid`});
                    return;
                }

            }
            else{
                res.send({error: `${i+1}-th game setting is invalid!`});
                return;
            }
        }
        res.send({gameIDS: createGameIDS});

    } catch (e) {
        console.error(e);
        res.send({error: 'Unable to manage'});
        return;
    }
    return;


});

router.post('/botlist', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    try {
        if (req.body.key == process.env.BOT_KEY) {
            let games = global.games.open.sort((a, b) => {
                return routeUtils.scoreGame(b) - routeUtils.scoreGame(a);
            });
            games = games.map(game => {
                return {
                    id: game.id,
                    setup: {
                        id: game.setup.id,
                        total: game.setup.total
                    },
                    players: game.players.length
                };
            });
            res.send({games: games});
        } else
            res.send({games: []});
    } catch (e) {
        console.error(e);
        res.send({games: []});
    }
});

router.post('/botcreate', async function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    try {
        if (req.body.key == process.env.BOT_KEY) {
            let existingGame = global.players[req.body.creator];
            let alreadyCreating = global.gameCreators[req.body.creator];

            if (!existingGame && !alreadyCreating) {
                global.gameCreators[req.body.creator] = true;
                let setup = await models.Setup.findOne({id: req.body.setup});
                let user = await models.User.findOne({dId: req.body.creator});
                let banned = user ? await routeUtils.checkBan(req.body.creator) : false;

                if (setup && user && !banned) {
                    user = new User(user, null);
                    setup = setup.toObject();
                    setup.roles = JSON.parse(setup.roles);
                    setup.stateLengths = [
                        {name: 'day', length: 600000},
                        {name: 'night', length: 120000},
                    ];

                    let emojis = await models.Emoji.find({server: true}).select('-_id -__v');
                    let game = new Game(setup, Boolean(req.body.private), false, emojis);
                    game.playerJoin(user, true);
                    delete global.gameCreators[req.body.creator];
                    res.send({id: game.id});
                } else {
                    delete global.gameCreators[req.body.creator];

                    if (!user)
                        res.send({msg: 'You must log in on the site before you can create a game.'});
                    else if (banned)
                        res.send({msg: 'You are currently banned from playing games.'});
                    else if (!setup)
                        res.send({msg: 'Setup not found.'});
                    else
                        res.send({});
                }
            } else if (existingGame)
                res.send({existing: existingGame.id});
            else
                res.send({});
        } else
            res.send({});
    } catch (e) {
        console.error(e);
        res.send({});
    }
});

router.post('/botleave', function (req, res, next) {
    let game = global.players[req.body.id];
    if (req.body.key == process.env.BOT_KEY && game) {
        game.playerLeave(req.body.id);
        delete global.players[req.body.id];
        delete global.gameCreators[req.body.id];
        res.send('1');
    } else
        res.send('0');
});

module.exports = router;
