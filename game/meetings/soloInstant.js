const Meeting = require('../core/meeting');

module.exports = class SoloInstant extends Meeting {

    constructor (name, game) {
        super(name, game);

        this.voting = true;
        this.instant = true;
        this.targets = { include: ['alive'], exclude: ['self'] };
    }

}
