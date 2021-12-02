var express = require('express');
var shortid = require('shortid');
var oHash = require('object-hash');
var models = require('../db/models');
var routeUtils = require('./routeUtils');
var alignmentMap = require('../game/groups/alignments');
var router = express.Router();

router.get('/id', async function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    try {
        let setup = await models.Setup.findOne({id: String(req.query.query)})
            .select('id name roles closed count -_id')
        res.send({setups: [setup], pages: 0});
    }
    catch (e) {
        console.error(e);
        res.send({setups: [], pages: 1});
    }
});

router.get('/featured', async function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    try {
        let step = Number(process.env.PAGE_STEP);
        let pageLimit = 10;
        let start = ((Number(req.query.page) || 1) - 1) * step;

        if (start < 50) {
            let setups = await models.Setup.find({featured: true})
                .limit(step * pageLimit)
                .select('id name roles closed count -_id');
            let count = setups.length;
            res.send({setups: setups.slice(start, start + step), pages: Math.ceil(count / step)});
        }
        else
            res.send({setups: [], pages: 1});
    }
    catch (e) {
        console.error(e);
        res.send({setups: [], pages: 1});
    }
});

router.get('/popular', async function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    try {
        let step = Number(process.env.PAGE_STEP);
        let pageLimit = 10;
        let start = ((Number(req.query.page) || 1) - 1) * step;

        if (start < 50) {
            let setups = await models.Setup.find()
                .sort('-played')
                .limit(step * pageLimit)
                .select('id name roles closed count -_id');
            let count = setups.length;
            res.send({setups: setups.slice(start, start + step), pages: Math.ceil(count / step)});
        }
        else
            res.send({setups: [], pages: 1});
    }
    catch (e) {
        console.error(e);
        res.send({setups: [], pages: 1});
    }
});

router.get('/favorites', async function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    try {
        let dId = await routeUtils.verifyLoggedIn(req, res, false);
        let step = Number(process.env.PAGE_STEP);
        let start = ((Number(req.query.page) || 1) - 1) * step;

        if (start < 50) {
            let user = await models.User.findOne({dId: dId})
                .populate('favSetups', 'id name roles closed count -_id')
                .select('favSetups');
            let setups = user.favSetups.reverse().slice(start, start + step);
            let count = user.favSetups.length;

            if (count > 50)
                count = 50;
            res.send({setups: setups, pages: Math.ceil(count / step)});
        }
        else
            res.send({setups: [], pages: 1});
    }
    catch (e) {
        console.error(e);
        res.send({setups: [], pages: 1});
    }
});

router.get('/created', async function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    try {
        let dId = await routeUtils.verifyLoggedIn(req, res, false);
        let step = Number(process.env.PAGE_STEP);
        let start = ((Number(req.query.page) || 1) - 1) * step;

        if (start < 50) {
            let user = await models.User.findOne({dId: dId})
                .populate('setups', 'id name roles closed count -_id')
                .select('setups');
            let setups = user.setups.reverse().slice(start, start + step);
            let count = user.setups.length;

            if (count > 50)
                count = 50;
            res.send({setups: setups, pages: Math.ceil(count / step)});
        }
        else
            res.send({setups: [], pages: 1});
    }
    catch (e) {
        console.error(e);
        res.send({setups: [], pages: 1});
    }
});

router.get('/search', async function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    try {
        let step = Number(process.env.PAGE_STEP);
        let pageLimit = 10;
        let start = ((Number(req.query.page) || 1) - 1) * step;

        if (start < 50) {
            let setups = await models.Setup.find({name: {$regex: String(req.query.query), $options: 'i'}})
                .sort('-played')
                .limit(step * pageLimit)
                .select('id name roles closed count -_id');
            let count = setups.length;
            res.send({setups: setups.slice(start, start + step), pages: Math.ceil(count / step)});
        }
        else
            res.send({setups: [], pages: 1});
    }
    catch (e) {
        console.error(e);
        res.send({setups: [], pages: 1});
    }
});

router.get('/favorites/id', async function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    try {
        let dId = await routeUtils.verifyLoggedIn(req, res, false);
        let user = await models.User.findOne({dId: dId})
            .populate('favSetups', 'id -_id')
            .select('favSetups');
        res.send(user.favSetups.map(s => s.id));
    }
    catch (e) {
        console.error(e);
        res.send([]);
    }
});

router.get('/:id', async function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    try {
        let setup = await models.Setup.findOne({id: req.params.id})
            .select('-_id -__v')
            .populate('creator', 'dId name avatar tag -_id')
        if (setup) {
            setup = setup.toObject();
            res.send(setup);
        }
        else
            res.send({error: 'Unable to find setup'});
    }
    catch (e) {
        console.error(e);
        res.send({error: 'Unable to find setup'});
    }
});

router.post('/favorite', async function (req, res, next) {
    try {
        let dId = await routeUtils.verifyLoggedIn(req, res, false);
        let user = await models.User.findOne({dId: dId})
            .select('favSetups')
            .populate('favSetups', 'id');
        let setups = user ? user.favSetups.map(setup => setup.id) : [];
        let index = setups.indexOf(req.body.id);
        let setup = await models.Setup.findOne({id: String(req.body.id)})

        if (setup && user && index != -1) { //Already favorited, unfavorite
            await models.User.update({dId: dId}, {$pull: {favSetups: setup._id}}).exec();
            await models.Setup.update({id: setups[index]}, {$inc: {favorites: -1}}).exec();
            res.send('1');
        }
        else if (setup && user && index == -1) { //Not favorited yet, favorite
            await models.User.update({dId: dId}, {$push: {favSetups: setup._id}}).exec();
            await models.Setup.update({id: setup.id}, {$inc: {favorites: 1}}).exec();
            res.send('1');
        }
        else
            res.send('0');
    }
    catch (e) {
        console.error(e);
        res.send('0');
    }
});

router.post('/delete', async function (req, res, next) {
    try {
        let dId = await routeUtils.verifyLoggedIn(req, res, false);
        let user = await models.User.findOne({dId: dId})
            .select('_id');
        let setup = await models.Setup.findOne({id: String(req.body.id)})
            .select('_id');

        if (setup && user) {
            await models.User.update({dId: dId}, {$pull: {setups: setup._id}}).exec();
            await models.Setup.update({id: String(req.body.id), creator: user._id}, {$unset: {creator: ''}}).exec();
            res.send('1');
        }
        else
            res.send('0');
    }
    catch (e) {
        console.error(e);
        res.send('0');
    }
});

router.post('/create', async function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    try {
        let dId = await routeUtils.verifyLoggedIn(req, res, false);
        let canEdit = true;

        if (req.body.edit) {
            let setup = await models.Setup.findOne({id: String(req.body.id)})
                .populate('creator', 'dId');
            if (!setup || setup.creator.dId != dId) {
                canEdit = false;
                res.send({error: 'You can only edit setups you have created'});
            }
        }

        if (canEdit) {
            let setup = Object(req.body);
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
                        }
                        else
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
                }
                else if (Array.isArray(roles)) { //Open role setups
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
                                    }
                                    else {
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
                                }
                                else
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
                                        }
                                        else
                                            return a < b ? -1 : 1;
                                    })
                                    .forEach(roleName => {
                                        tempRoleset[roleName] = roleset[roleName];
                                        delete roleset[roleName];
                                        roleset[roleName] = tempRoleset[roleName];
                                    });
                            }
                        }
                        else
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
                        }
                        else {
                            create = false;
                            res.send({error: 'Mafia and monsters must each make up less than half of the roles'});
                        }
                    }
                    else {
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
                    if (!existingSetup || (req.body.edit && existingSetup.id == req.body.id)) {
                        if (req.body.edit) {
                            await models.Setup.update(
                                {id: setup.id},
                                {
                                    $set: {
                                        hash: hash,
                                        name: String(setup.name),
                                        closed: Boolean(setup.closed),
                                        unique: Boolean(setup.unique),
                                        roles: JSON.stringify(roles),
                                        count: setup.count,
                                        total: total,
                                        startState: String(setup.startState),
                                        whispers: Boolean(setup.whispers),
                                        leakPercentage: Number(setup.leakPercentage),
                                        lastWill: Boolean(setup.lastWill),
                                        mustAct: Boolean(setup.mustAct),
                                        noReveal: Boolean(setup.noReveal)
                                    }
                                }
                            ).exec();
                            res.send({error: null, id: req.body.id});
                        }
                        else {
                            setup = new models.Setup({
                                id: shortid.generate(),
                                hash: hash,
                                name: String(setup.name),
                                creator: req.user._id,
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

                            await setup.save()
                            await models.User.update({dId: dId}, {$push: {setups: setup._id}}).exec();
                            res.send({error: null, id: setup.id});
                        }
                    }
                    else
                        res.send({error: `Setup already exists: '${existingSetup.name}'`});
                }
            }
            else if (!setup.name.length)
                res.send({error: 'You must give your setup a name'});
            else
                res.send({error: 'Role data invalid'});
        }
    }
    catch (e) {
        console.error(e);
        res.send({error: 'Unable to make setup'});
    }
});

module.exports = router;
