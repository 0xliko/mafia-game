const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithVillage = require('../cards/winCondition/winWithVillage');
const SoloKiller = require('../cards/meeting/soloKiller');

module.exports = class Vigilante extends Role {

    constructor (player) {
        super('Vigilante', player);
        this.alignment = 'village';
        this.roleCards = [VillageCore, WinWithVillage, SoloKiller];
        this.meetingMods = {
            'Solo Kill': {
                meetName: 'Kill'
            }
        }
    }

}
