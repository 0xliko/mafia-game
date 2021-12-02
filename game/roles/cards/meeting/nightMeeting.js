const RoleCard = require('../../../core/roleCard');

module.exports = class NightMeeting extends RoleCard {

    constructor (role) {
        super(role);

        this.meetings = {
            'Night Meeting': {
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
