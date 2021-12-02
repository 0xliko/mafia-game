const Meeting = require('../core/meeting');

module.exports = class SoloSaver extends Meeting {

    constructor (name, game) {
        super(name, game);

        this.voting = true;
        this.targets = { include: ['alive'], exclude: [] };
    }

}
