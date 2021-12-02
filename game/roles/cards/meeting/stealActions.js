const RoleCard = require('../../../core/roleCard');

module.exports = class StealActions extends RoleCard {

    constructor (role) {
        super(role);

        this.meetings = {
            'Steal Actions': {
                type: 'Solo',
                times: Infinity,
                state: 'night',
                group: false,
                voteWeight: 1,
                canVote: true,
                canSeeVotes: true,
                action: {
                    labels: ['redirect', 'actors'],
                    visit: true,
                    priority: -99,
                    do: (self) => {
                        for (let action of self.game.actionQueue[0]) {
                            if (action.actor == self.target) {
                                action.actor = self.actor;
                                action.labels.push('absolute');
                            }
                        }
                    }
                }
            }
        };
    }

}
