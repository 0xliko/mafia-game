const Meeting = require('../core/meeting');

module.exports = class GroupVote extends Meeting {

    constructor (name, game) {
        super(name, game);

        this.group = true;
        this.voting = true;
        this.targets = { include: ['alive'], exclude: ['members'] };
    }

}
