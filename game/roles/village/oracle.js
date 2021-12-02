const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithVillage = require('../cards/winCondition/winWithVillage');
const DeathRevealer = require('../cards/meeting/deathRevealer');

module.exports = class Oracle extends Role {

    constructor (player) {
        super('Oracle', player);
        this.alignment = 'village';
        this.roleCards = [VillageCore, WinWithVillage, DeathRevealer];
    }

}
