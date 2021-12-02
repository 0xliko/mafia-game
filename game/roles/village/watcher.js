const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithVillage = require('../cards/winCondition/winWithVillage');
const Watch = require('../cards/meeting/watch');

module.exports = class Watcher extends Role {

    constructor (player) {
        super('Watcher', player);
        this.alignment = 'village';
        this.roleCards = [VillageCore, WinWithVillage, Watch];
    }

}
