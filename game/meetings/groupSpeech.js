const Meeting = require('../core/meeting');

module.exports = class GroupSpeech extends Meeting {

    constructor (name, game) {
        super(name, game);

        this.group = true;
        this.speech = true;
    }

}
