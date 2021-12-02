const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithVillage = require('../cards/winCondition/winWithVillage');
const SeeRandomSenders = require('../cards/misc/seeRandomSenders');

module.exports = class VillageIdiot extends Role {

    constructor (player) {
        super('Village Idiot', player);
        this.alignment = 'village';
        this.appearance.self = 'Villager';
        this.roleCards = [VillageCore, WinWithVillage, SeeRandomSenders];
    }

}
