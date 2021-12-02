const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithMafia = require('../cards/winCondition/winWithMafia');
const MeetingMafia = require('../cards/meeting/meetingMafia');
const GuessRoleKill = require('../cards/meeting/guessRoleKill');

module.exports = class Spy extends Role {

    constructor (player) {
        super('Spy', player);
        this.alignment = 'mafia';
        this.roleCards = [VillageCore, WinWithMafia, MeetingMafia, GuessRoleKill];
        this.roleToGuess = 'Agent';
        this.meetingMods = {
            'Guess': {
                meetName: 'Guess Agent',
                targets: {include: ['alive'], exclude: ['mafia']}
            }
        };
    }

}
