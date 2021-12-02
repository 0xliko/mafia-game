const Meeting = require('../core/meeting');

module.exports = class GroupSpeechVote extends Meeting {

    constructor (name, game) {
        super(name, game);

        this.group = true;
        this.speech = true;
        this.voting = true;
        this.targets = { include: ['alive'], exclude: ['members'] };
    }

}
