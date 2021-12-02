const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithVillage = require('../cards/winCondition/winWithVillage');
const Armor = require('../../items/armor');

module.exports = class Knight extends Role {

    constructor (player) {
        super('Knight', player);
        this.alignment = 'village';
        this.roleCards = [VillageCore, WinWithVillage];
        this.startItems.push(new Armor(this.game));
    }

}
