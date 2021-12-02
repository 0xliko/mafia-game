const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithVillage = require('../cards/winCondition/winWithVillage');
const NightMeeting = require('../cards/meeting/nightMeeting');

module.exports = class Illuminato extends Role {

    constructor (player) {
        super('Illuminato', player);
        this.alignment = 'village';
        this.roleCards = [VillageCore, WinWithVillage, NightMeeting];
        this.meetingMods = {
            'Night Meeting': {
                meetName: 'Illuminati Meeting'
            }
        };
    }

}
