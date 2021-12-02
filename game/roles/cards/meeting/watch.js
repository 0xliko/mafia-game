const RoleCard = require('../../../core/roleCard');

module.exports = class VisitInSeer extends RoleCard {

    constructor (role) {
        super(role);

        this.meetings = {
            'Watch': {
                type: 'Solo',
                times: Infinity,
                state: 'night',
                group: false,
                voteWeight: 1,
                canVote: true,
                canSeeVotes: true,
                targets: { include: ['alive'], exclude: [] },
                action: {
                    labels: ['watch'],
                    visit: true,
                    priority: 100,
                    do: (self) => {
                        let visitors = {};
                        for (let action of self.game.actionQueue[0]) {
                            if (action.visit && action.target == self.target && action.actor != self.actor)
                                visitors[action.actor.name] = true;
                        }
                        visitors = Object.keys(visitors);
                        visitors = visitors.length ? visitors.join(', ') : 'No one';
                        self.game.alertPlayer(`${visitors} visited ${self.target.name} during the night`, self.actor, true, true);
                    }
                }
            }
        };
    }

}
