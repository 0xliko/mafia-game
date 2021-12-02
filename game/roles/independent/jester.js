const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinSelfLynch = require('../cards/winCondition/winSelfLynch');

module.exports = class Jester extends Role {

    constructor (player) {
        super('Jester', player);
        this.alignment = 'independent';
        this.winCount = 'village';
        this.roleCards = [VillageCore, WinSelfLynch];
    }

}
