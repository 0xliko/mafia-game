const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithVillage = require('../cards/winCondition/winWithVillage');
const StealActions = require('../cards/meeting/stealActions');

module.exports = class Monkey extends Role {

    constructor (player) {
        super('Monkey', player);
        this.alignment = 'village';
        this.roleCards = [VillageCore, WinWithVillage, StealActions];
        this.meetingMods = {
            'Steal Actions': {
                meetName: 'Monkey See'
            }
        };
    }

}
