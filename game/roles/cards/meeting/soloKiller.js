const RoleCard = require('../../../core/roleCard');

module.exports = class SoloKiller extends RoleCard {

    constructor (role) {
        super(role);

        this.meetings = {
            'Solo Kill': {
                type: 'Solo',
                times: Infinity,
                state: 'night',
                group: false,
                voteWeight: 1,
                canVote: true,
                canSeeVotes: true,
                action: {
                    labels: ['kill', 'village'],
                    visit: true,
                    priority: 0,
                    do: (self) => {
                        if (!self.target.hasImmunity(['kill', 'village']))
                            self.target.kill('basic', false, self.actor, self.visit);
                    }
                }
            }
        };
    }

}
