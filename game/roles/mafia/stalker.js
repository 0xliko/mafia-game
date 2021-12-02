const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithMafia = require('../cards/winCondition/winWithMafia');
const MeetingMafia = require('../cards/meeting/meetingMafia');
const RoleLearner = require('../cards/meeting/roleLearner');

module.exports = class Stalker extends Role {

    constructor (player) {
        super('Stalker', player);
        this.alignment = 'mafia';
        this.roleCards = [VillageCore, WinWithMafia, MeetingMafia, RoleLearner];
        this.meetingMods = {
            'Learn Role': {
                meetName: 'Stalk',
                targets: {include: ['alive'], exclude: ['mafia']}
            }
        };
    }

}
