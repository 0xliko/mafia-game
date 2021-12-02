const Meeting = require('../core/meeting');

module.exports = class Group extends Meeting {

    constructor (name, game) {
        super(name, game);

        this.group = true;
    }

}
