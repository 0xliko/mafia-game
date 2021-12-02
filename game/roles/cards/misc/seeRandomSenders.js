const RoleCard = require('../../../core/roleCard');
const utils = require('../../../core/utils');

module.exports = class SeeRandomSenders extends RoleCard {

    constructor (role) {
        super(role);
    }

    hear (message) {
        if (message.sender != this.role.player) {
            message = Object.assign({}, message);
            let possibleSenders = this.role.game.players.filter(p => p != this.role.player && p.alive);
            message.sender = utils.randArrVal(possibleSenders);
        }
        return message;
    }

}
