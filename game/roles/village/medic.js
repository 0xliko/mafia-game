const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithVillage = require('../cards/winCondition/winWithVillage');
const Saver = require('../cards/meeting/saver');

module.exports = class Medic extends Role {

    constructor (player) {
        super('Medic', player);
        this.alignment = 'village';
        this.roleCards = [VillageCore, WinWithVillage, Saver];
        this.meetingMods = {
            'Save': {
                targets: { include: ['alive'], exclude: [] },
            }
        };
    }

}
