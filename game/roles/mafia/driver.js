const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithMafia = require('../cards/winCondition/winWithMafia');
const MeetingMafia = require('../cards/meeting/meetingMafia');
const RedirectVisitors = require('../cards/meeting/redirectVisitors');

module.exports = class Godfather extends Role {

    constructor (player) {
        super('Driver', player);
        this.alignment = 'mafia';
        this.roleCards = [VillageCore, WinWithMafia, MeetingMafia, RedirectVisitors];
    }

}
