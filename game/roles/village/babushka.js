const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithVillage = require('../cards/winCondition/winWithVillage');
const KillVisitors = require('../cards/eventListener/killVisitors');

module.exports = class Babushka extends Role {

    constructor (player) {
        super('Babushka', player);
        this.alignment = 'village';
        this.roleCards = [VillageCore, WinWithVillage, KillVisitors];
        this.immunity.kill = true;
    }

}
