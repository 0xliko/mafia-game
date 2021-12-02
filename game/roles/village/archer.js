const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithVillage = require('../cards/winCondition/winWithVillage');
const LynchRevenge = require('../cards/eventListener/lynchRevenge');

module.exports = class Archer extends Role {

    constructor (player) {
        super('Archer', player);
        this.alignment = 'village';
        this.roleCards = [VillageCore, WinWithVillage, LynchRevenge];
    }

}
