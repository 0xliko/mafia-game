const Meeting = require('../core/meeting');

module.exports = class Pregame extends Meeting {

    constructor (game) {
        super('Pregame', game);

        this.group = true;
        this.speech = true;
    }

}
