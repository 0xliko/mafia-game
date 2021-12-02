var express = require('express');
var utils = require('../game/core/utils');
var models = require('../db/models');
var routeUtils = require('./routeUtils');
var router = express.Router();

router.post('/openPack', async function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    try {
        let dId = await routeUtils.verifyLoggedIn(req, res, false);
        let user = await models.User.findOne({dId: dId});

        if (user.emojiPacks.get(req.body.type) > 0) {
            let rarity, val = utils.random(1, 1000);

            if (val >= 1 && val <= 400) //40%
                rarity = 1;
            else if (val <= 700) //30%
                rarity = 2;
            else if (val <= 850) //15%
                rarity = 3;
            else if (val <= 948) //9.8%
                rarity = 4;
            else if (val <= 998) //5%
                rarity = 5;
            else if (val <= 1000) //0.2%
                rarity = 6;

            let emojis = await models.Emoji.find({inPacks: true, rarity: rarity});
            let emoji = utils.randArrVal(emojis);

            await models.User.update(
                {dId: dId},
                {$inc:
                    {
                        [`emojis.${emoji.name}`]: 1,
                        [`emojiPacks.${req.body.type}`]: -1
                    }
                }
            );
            res.send({emoji: emoji.name});
        }
    }
    catch (e) {
        console.error(e);
        res.send({});
    }
});

module.exports = router;
