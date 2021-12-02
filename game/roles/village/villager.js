const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithVillage = require('../cards/winCondition/winWithVillage');

module.exports = class Villager extends Role {

    constructor (player) {
        super('Villager', player);
        this.alignment = 'village';
        this.roleCards = [VillageCore, WinWithVillage];
    }

}
