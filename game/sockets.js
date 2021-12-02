const ioSession = require('express-socket.io-session');
const shortid = require('shortid');
const global = require('../global');
const sessionMiddleware = require('../session');
const models = require('../db/models');
const User = require('./core/user');
const Message = require('./core/message');

module.exports = async function (io) {
    try {
        io.use(ioSession(sessionMiddleware));
        io.on('connection', async function (socket) {
            if (socket.handshake.session.passport && socket.handshake.session.passport.user) {
                const session = socket.handshake.session.passport.user;

                let user = await models.User.findOne({dId: session.dId});
                if (user && !user.ban) {
                    user = new User(user, socket);
                    let game = null;

                    socket.emit('connected');

                    socket.on('join', function (gameId, isTest) {
                        if (isTest && user.dev) {
                            user.id = shortid.generate();
                            user.name = shortid.generate();
                        }

                        if (!global.players[user.id]) { //not in game yet
                            for (let openGame of global.games.open) {
                                if (openGame.id == gameId) {
                                    game = openGame;
                                    break;
                                }
                            }

                            if (!game) {
                                for (let privateGame of global.games.private) {
                                    if (privateGame.id == gameId) {
                                        game = privateGame;
                                        break;
                                    }
                                }
                            }

                            if (game) {
                                game.playerJoin(user, true);
                                listeners(user, game);
                            }
                            else
                                socket.emit('redirect');
                        }
                        else if (global.players[user.id].id == gameId && !game) { //in same game
                            game = global.players[user.id];
                            game.playerJoin(user, false);
                            listeners(user, game);
                        }
                        else //in a different game
                            socket.emit('redirect');
                    });
                }
                else
                    socket.emit('redirect');
            }
        });
    }
    catch (e) {
        console.error(e);
    }
};

function listeners (user, game) {
    let socket = user.socket;
    let msgPast = [];

    socket.on('msg', function (message, meetingId, recipient, type) {
        if (message.length > 240)
            message = message.slice(0, 240);

        let rateLimit = game.rateLimit(msgPast);

        if (message.length && rateLimit) {
            msgPast.push(Date.now());
            user.player.speak({
                content: message,
                sender: user.player,
                original_sender: user.player,
                meeting: meetingId,
                recipient: recipient || '*',
                type: type
            });
        }
        else if (!rateLimit)
            socket.emit('spam');
    });

    socket.on('vote', function (selection, meetingId) {
        let meeting = game.getMeeting(meetingId);
        if (meeting)
            meeting.vote(user.player, selection);
    });

    socket.on('unvote', function (meetingId) {
        let meeting = game.getMeeting(meetingId);
        if (meeting)
            meeting.unvote(user.player);
    });

    socket.on('will', function (message) {
        if (game.setup.lastWill)
            user.player.lastWill = message;
    });

    socket.on('quote', function (id, meetingId) {
        let meeting = game.getMeeting(meetingId);
        if (meeting)
            meeting.quote(user.player.id, id);
    });

    socket.on('leave', function () {
        game.playerLeave(user.id);
    });
}
