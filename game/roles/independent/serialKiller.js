const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinAmongTwo = require('../cards/winCondition/winAmongTwo');
const SoloKiller = require('../cards/meeting/soloKiller');

module.exports = class SerialKiller extends Role {

    constructor (player) {
        super('Serial Killer', player);
        this.alignment = 'independent';
        this.roleCards = [VillageCore, WinAmongTwo, SoloKiller];
        this.meetingMods = {
            'Solo Kill': {
                mandatory: true
            }
        };
    }

}
