const RoleCard = require('../../../core/roleCard');

module.exports = class RedirectVisitors extends RoleCard {

    constructor (role) {
        super(role);

        this.meetings = {
            'Redirect A': {
                meetName: 'Destination A',
                type: 'Solo',
                times: Infinity,
                state: 'night',
                group: false,
                voteWeight: 1,
                canVote: true,
                canSeeVotes: true,
                targets: {include: ['alive'], exclude: []},
                action: {
                    labels: ['redirect', 'visitors'],
                    visit: false,
                    priority: -98,
                    do: (self) => {
                        self.actor.role.pickupTarget = self.target;
                    }
                }
            },
            'Redirect B': {
                meetName: 'Destination B',
                type: 'Solo',
                times: Infinity,
                state: 'night',
                group: false,
                voteWeight: 1,
                canVote: true,
                canSeeVotes: true,
                mandatory: true,
                targets: {include: ['alive'], exclude: []},
                action: {
                    labels: ['redirect', 'visitors'],
                    visit: false,
                    priority: -97,
                    do: (self) => {
                        if (self.actor.role.pickupTarget) {
                            for (let action of self.game.actionQueue[0]) {
                                if (action.actor != self.actor || !action.hasLabel('redirect')) {
                                    if (action.target == self.actor.role.pickupTarget)
                                        action.target = self.target;
                                    else if (action.target == self.target)
                                        action.target = self.actor.role.pickupTarget;
                                }
                            }
                            delete self.actor.role.pickupTarget;
                        }
                    }
                }
            }
        };
    }

}
