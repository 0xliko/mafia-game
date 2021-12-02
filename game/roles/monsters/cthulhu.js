const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithMonsters = require('../cards/winCondition/winWithMonsters');
const MeetingMonster = require('../cards/meeting/meetingMonster');
const InsaneVisitors = require('../cards/eventListener/insaneVisitors');

module.exports = class Cthulhu extends Role {

    constructor (player) {
        super('Cthulhu', player);
        this.alignment = 'monsters';
        this.roleCards = [VillageCore, WinWithMonsters, MeetingMonster, InsaneVisitors];
    }

}
