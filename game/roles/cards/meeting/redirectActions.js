const RoleCard = require('../../../core/roleCard');

module.exports = class RedirectVisitors extends RoleCard {

    constructor (role) {
        super(role);

        this.meetings = {
            'Redirect Actor': {
                meetName: 'Control',
                type: 'Solo',
                times: Infinity,
                state: 'night',
                group: false,
                voteWeight: 1,
                canVote: true,
                canSeeVotes: true,
                action: {
                    labels: ['redirect', 'visitors'],
                    visit: false,
                    priority: -98,
                    do: (self) => {
                        self.actor.role.controlledActor = self.target;
                    }
                }
            },
            'Redirect Target': {
                meetName: 'Redirect To',
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
                        if (self.actor.role.controlledActor) {
                            for (let action of self.game.actionQueue[0]) {
                                if (action.actor == self.actor.role.controlledActor)
                                    action.target = self.target;
                            }
                            delete self.actor.role.controlledActor;
                        }
                    }
                }
            }
        };
    }

}
