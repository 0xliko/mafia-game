const RoleCard = require('../../../core/roleCard');

module.exports = class VillageCore extends RoleCard {

    constructor (role) {
        super(role);

        this.meetings = {
            'Village': {
                type: 'Village',
                times: Infinity,
                state: 'day',
                group: true,
                voteWeight: 1,
                canVote: true,
                canSeeSpeech: true,
                canSeeVotes: true,
                canTalk: true,
                leader: false,
                speechAbilities: [],
                action: {
                    labels: ['kill', 'lynch'],
                    visit: false,
                    priority: 0,
                    do: (self) => {
                        if (!self.target.hasImmunity('lynch'))
                            self.target.kill('lynch', false, self.actor, self.visit);
                    }
                }
            }
        };
    }

}
