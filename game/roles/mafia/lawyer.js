const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithMafia = require('../cards/winCondition/winWithMafia');
const MeetingMafia = require('../cards/meeting/meetingMafia');
const MakeInno = require('../cards/meeting/makeInno');

module.exports = class Lawyer extends Role {

    constructor (player) {
        super('Lawyer', player);
        this.alignment = 'mafia';
        this.roleCards = [VillageCore, WinWithMafia, MeetingMafia, MakeInno];
    }

}
