const Role = require('../../core/role');
const VillageCore = require('../cards/meeting/villageCore');
const WinWithVillage = require('../cards/winCondition/winWithVillage');
const AlignmentLearner = require('../cards/meeting/alignmentLearner');

module.exports = class Cop extends Role {

    constructor (player) {
        super('Cop', player);
        this.alignment = 'village';
        this.roleCards = [VillageCore, WinWithVillage, AlignmentLearner];
        this.meetingMods = {
            'Learn Alignment': {
                group: true,
                speech: true,
                canSeeSpeech: true,
                canTalk: true
            }
        }
    }

}
