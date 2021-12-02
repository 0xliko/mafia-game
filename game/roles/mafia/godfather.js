const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithMafia = require('../cards/winCondition/winWithMafia');
const MeetingMafia = require('../cards/meeting/meetingMafia');

module.exports = class Godfather extends Role {

    constructor (player) {
        super('Godfather', player);
        this.alignment = 'mafia';
        this.roleCards = [VillageCore, WinWithMafia, MeetingMafia];
        this.appearance.investigate = 'Villager';
        this.meetingMods = {
            'Mafia': {
                leader: true
            }
        }
    }

}
