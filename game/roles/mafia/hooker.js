const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithMafia = require('../cards/winCondition/winWithMafia');
const MeetingMafia = require('../cards/meeting/meetingMafia');
const RoleBlocker = require('../cards/meeting/roleBlocker');

module.exports = class Hooker extends Role {

    constructor (player) {
        super('Hooker', player);
        this.alignment = 'mafia';
        this.roleCards = [VillageCore, WinWithMafia, MeetingMafia, RoleBlocker];
        this.meetingMods = {
            'Role Block': {
                targets: {include: ['alive'], exclude: ['mafia']}
            }
        };
    }

}
