var models = require('../db/models');

module.exports = {
    verifyLoggedIn: function (req, res, redirect) {
        return new Promise((resolve, reject) => {
            if (req.user && req.user.dId)
                resolve(req.user.dId);
            else {
                if (redirect != false)
                    res.redirect(`/login${redirect ? `?redirect=${redirect}` : ''}`);
                reject(null);
            }
        });
    },
    checkBan: function (dId) {
        return new Promise(async function (res, rej) {
            try {
                let user = await models.User.findOne({dId: dId}).select('ban').populate('ban');
                if (user && user.ban) {
                    if (user.ban.created + user.ban.length < Date.now()) {
                        models.User.update({dId: dId}, {$unset: {ban: ''}}).exec();
                        models.Ban.deleteOne({user: user._id});
                        res(false);
                    }
                    else
                        res(true);
                }
                else
                    res(false);
            }
            catch (e) {
                console.error(e);
                rej(e);
            }
        });
    },
    scoreGame: function (game) {
        let playerAmt = game.players.length;
        let total = game.setup.total;
        return playerAmt * (playerAmt / total);
    }
}
