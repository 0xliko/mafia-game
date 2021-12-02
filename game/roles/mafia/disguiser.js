const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithMafia = require('../cards/winCondition/winWithMafia');
const MeetingMafia = require('../cards/meeting/meetingMafia');
const Disguise = require('../cards/meeting/disguise');

module.exports = class Disguiser extends Role {

    constructor (player) {
        super('Disguiser', player);
        this.alignment = 'mafia';
        this.roleCards = [VillageCore, WinWithMafia, MeetingMafia, Disguise];
    }

}
