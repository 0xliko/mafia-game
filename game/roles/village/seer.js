const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithVillage = require('../cards/winCondition/winWithVillage');
const RoleLearner = require('../cards/meeting/roleLearner');

module.exports = class Seer extends Role {

    constructor (player) {
        super('Seer', player);
        this.alignment = 'village';
        this.roleCards = [VillageCore, WinWithVillage, RoleLearner];
    }

}
