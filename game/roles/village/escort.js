const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithVillage = require('../cards/winCondition/winWithVillage');
const RoleBlocker = require('../cards/meeting/roleBlocker');

module.exports = class Escort extends Role {

    constructor (player) {
        super('Escort', player);
        this.alignment = 'village';
        this.roleCards = [VillageCore, WinWithVillage, RoleBlocker];
    }

}
