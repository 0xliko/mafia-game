const RoleCard = require('../../../core/roleCard');

module.exports = class MeetingMonster extends RoleCard {

    constructor (role) {
        super(role);

        this.meetings = {
            'Monster': {
                type: 'GroupSpeech',
                times: Infinity,
                state: 'night',
                group: true,
                canSeeSpeech: true,
                canTalk: true,
                speechAbilities: []
            }
        };
    }

}
