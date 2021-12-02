const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithVillage = require('../cards/winCondition/winWithVillage');
const KillKiller = require('../cards/eventListener/killKiller');

module.exports = class Bomb extends Role {

    constructor (player) {
        super('Bomb', player);
        this.alignment = 'village';
        this.roleCards = [VillageCore, WinWithVillage, KillKiller];
    }

}
