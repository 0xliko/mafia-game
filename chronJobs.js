const global = require('./global');
const models = require('./db/models');

module.exports = function () {
    const jobs = {
        expireGames: {
            run: async function () {
                try {
                    let oldGames = await models.Game.find({timeEnd: {$lt: Date.now() - (1000 * 60 * 60 * 24 * 7)}}).select('_id players');

                    for (let game of oldGames) {
                        for (let player of game.players)
                            models.User.updateOne({_id: player}, {$pull: {games: game._id}}).exec();

                        models.Game.deleteOne({_id: game._id}).exec();
                    }
                }
                catch (e) {
                    console.error(e);
                }
            },
            interval: 1000 * 60 * 10
        },
        findNextRestart: {
            run: async function () {
                try {
                    let count = await models.Restart.count({time: {$lt: Date.now()}})
                    await models.Restart.deleteMany({time: {$lt: Date.now()}}).exec();

                    if (count == 0) {
                        let restart = await models.Restart.find().sort('time');

                        if (restart[0])
                            global.restart = Math.round((restart[0].time - Date.now()) / (1000 * 60));
                        else
                            global.restart = null;
                    }
                    else
                        process.exit();
                }
                catch (e) {
                    console.error(e);
                }
            },
            interval: 1000 * 60
        }
    };

    for (let jobName in jobs) {
        jobs[jobName].run();
        setInterval(jobs[jobName].run, jobs[jobName].interval);
    }
};
