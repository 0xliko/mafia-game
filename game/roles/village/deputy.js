const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithVillage = require('../cards/winCondition/winWithVillage');
const Gun = require('../../items/gun');

module.exports = class Deputy extends Role {

    constructor (player) {
        super('Deputy', player);
        this.alignment = 'village';
        this.roleCards = [VillageCore, WinWithVillage];
        this.startItems.push(new Gun(this.game, 0));
    }

}
