const RoleCard = require('../../../core/roleCard');

module.exports = class RoleBlocker extends RoleCard {

    constructor (role) {
        super(role);

        this.meetings = {
            'Role Block': {
                type: 'Solo',
                times: Infinity,
                state: 'night',
                group: false,
                voteWeight: 1,
                canVote: true,
                canSeeVotes: true,
                action: {
                    labels: ['block'],
                    visit: true,
                    priority: -96,
                    do: (self) => {
                        for (let action of self.game.actionQueue[0]) {
                            if (
                                action.actor == self.target &&
                                action.priority > self.priority && //stops roleblocks from blocking roleblocks
                                !action.hasLabel('absolute')
                            ) {
                                action.nullify(true);
                            }
                        }
                    }
                }
            }
        };
    }

}
