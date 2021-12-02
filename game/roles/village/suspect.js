const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithVillage = require('../cards/winCondition/winWithVillage');

module.exports = class Suspect extends Role {

    constructor (player) {
        super('Suspect', player);
        this.alignment = 'village';
        this.roleCards = [VillageCore, WinWithVillage];
        this.appearance.self = 'Villager';
        this.appearance.investigate = 'Mafioso';
        this.appearance.lynch = 'Mafioso';
    }

}
