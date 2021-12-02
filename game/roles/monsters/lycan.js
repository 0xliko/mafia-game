const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithMonsters = require('../cards/winCondition/winWithMonsters');
const MeetingMonster = require('../cards/meeting/meetingMonster');
const FullMoonInvincible = require('../cards/eventListener/fullMoonInvincible');
const EclipseInvincible = require('../cards/eventListener/eclipseInvincible');
const BitingWolf = require('../cards/meeting/bitingWolf');

module.exports = class Lycan extends Role {

    constructor (player) {
        super('Lycan', player);
        this.alignment = 'monsters';
        this.roleCards = [VillageCore, WinWithMonsters, MeetingMonster, FullMoonInvincible, EclipseInvincible, BitingWolf];
    }

}
