const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithVillage = require('../cards/winCondition/winWithVillage');
const GuessRoleKill = require('../cards/meeting/guessRoleKill');

module.exports = class Agent extends Role {

    constructor (player) {
        super('Agent', player);
        this.alignment = 'village';
        this.roleCards = [VillageCore, WinWithVillage, GuessRoleKill];
        this.roleToGuess = 'Spy';
        this.meetingMods = {
            'Guess': {
                meetName: 'Guess Spy'
            }
        };
    }

}
