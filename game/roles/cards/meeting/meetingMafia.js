const RoleCard = require('../../../core/roleCard');

module.exports = class MeetingMafia extends RoleCard {

    constructor (role) {
        super(role);

        this.meetings = {
            'Mafia': {
                type: 'GroupSpeechVote',
                times: Infinity,
                state: 'night',
                group: true,
                voteWeight: 1,
                canVote: true,
                canSeeSpeech: true,
                canSeeVotes: true,
                canTalk: true,
                leader: false,
                speechAbilities: [],
                action: {
                    labels: ['kill', 'mafia'],
                    visit: true,
                    priority: -1,
                    do: (self) => {
                        if (!self.target.hasImmunity(['kill', 'mafia'])) {
                            self.game.events.emit('mafiaKill', self);
                            self.target.kill('basic', false, self.actor, self.visit);
                        }
                    }
                }
            }
        };
    }

}
