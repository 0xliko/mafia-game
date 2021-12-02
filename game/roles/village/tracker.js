const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithVillage = require('../cards/winCondition/winWithVillage');
const Track = require('../cards/meeting/track');

module.exports = class Tracker extends Role {

    constructor (player) {
        super('Tracker', player);
        this.alignment = 'village';
        this.roleCards = [VillageCore, WinWithVillage, Track];
    }

}
