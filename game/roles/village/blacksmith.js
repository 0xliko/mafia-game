const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithVillage = require('../cards/winCondition/winWithVillage');
const AmorGiver = require('../cards/meeting/armorGiver');

module.exports = class Blacksmith extends Role {

    constructor (player) {
        super('Blacksmith', player);
        this.alignment = 'village';
        this.roleCards = [VillageCore, WinWithVillage, AmorGiver];
    }

}
