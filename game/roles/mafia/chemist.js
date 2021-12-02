const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithMafia = require('../cards/winCondition/winWithMafia');
const MeetingMafia = require('../cards/meeting/meetingMafia');
const Poisoner = require('../cards/meeting/poisoner');

module.exports = class Chemist extends Role {

    constructor (player) {
        super('Chemist', player);
        this.alignment = 'mafia';
        this.roleCards = [VillageCore, WinWithMafia, MeetingMafia, Poisoner];
        this.meetingMods = {
            'Poison': {
                targets: {include: ['alive'], exclude: ['mafia']}
            }
        };
    }

}
