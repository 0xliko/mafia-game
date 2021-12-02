const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithVillage = require('../cards/winCondition/winWithVillage');
const Gun = require('../../items/gun');

module.exports = class Sheriff extends Role {

    constructor (player) {
        super('Sheriff', player);
        this.alignment = 'village';
        this.roleCards = [VillageCore, WinWithVillage];
        this.startItems.push(new Gun(this.game, 1));
    }

}
