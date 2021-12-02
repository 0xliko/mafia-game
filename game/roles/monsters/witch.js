const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithMonsters = require('../cards/winCondition/winWithMonsters');
const MeetingMonster = require('../cards/meeting/meetingMonster');
const RedirectActions = require('../cards/meeting/redirectActions');
const EclipseOnDeath = require('../cards/eventListener/eclipseOnDeath');

module.exports = class Witch extends Role {

    constructor (player) {
        super('Witch', player);
        this.alignment = 'monsters';
        this.roleCards = [VillageCore, WinWithMonsters, MeetingMonster, RedirectActions, EclipseOnDeath];
    }

}
