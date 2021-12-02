const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithVillage = require('../cards/winCondition/winWithVillage');
const GunGiver = require('../cards/meeting/gunGiver');

module.exports = class ArmsDealer extends Role {

    constructor (player) {
        super('Arms Dealer', player);
        this.alignment = 'village';
        this.roleCards = [VillageCore, WinWithVillage, GunGiver];
    }

}
