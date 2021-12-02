const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const TakeDeadRole = require('../cards/meeting/takeDeadRole');

module.exports = class Amnesiac extends Role {

    constructor (player) {
        super('Amnesiac', player);
        this.alignment = 'independent';
        this.winCount = 'village';
        this.roleCards = [VillageCore, TakeDeadRole];
    }

}
