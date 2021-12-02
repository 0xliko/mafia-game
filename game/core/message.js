const shortid = require('shortid');

module.exports = class Message {

    constructor (game, content, sender, meeting, recipients, server, whisper, target) {
        this.id = shortid.generate();
        this.game = game;
        this.meeting = meeting;
        this.content = content;
        this.sender = sender;
        this.server = server;
        this.whisper = whisper;
        this.target = target;
        this.recipients = recipients;
    }

    send () {
        this.time = this.game.getTimeFormatted();
        this.stateCount = this.game.stateCount;

        for (let player of this.recipients) {
            if (player)
                player.hear(this);
        }

        this.game.record('message', {
            content: this.content,
            sender: this.sender,
            meeting: this.meeting,
            time: this.time,
            server: this.server,
            whisper: this.whisper,
            target: this.target
        });
    }

}

/*
    let msg = 'hello';
    let recip = player;

    let content = msgTemplates('basic', msg, this.player.name, [recip]);
    new Message (content, this.player);
*/
