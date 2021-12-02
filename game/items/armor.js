const Item = require('../core/item');

module.exports = class Armor extends Item {

    constructor (game) {
        super('Armor', game);
    }

    allowKill (how, instant, killer, visit, absolute) {
        if (how != 'lynch' && !absolute) {
            this.game.alertPlayer('Your armor saves you from an attack, breaking apart in the process', this.holder, true);
            this.drop();
            return false;
        }
        return true;
    }

}
