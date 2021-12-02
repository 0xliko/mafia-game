const RoleCard = require('../../../core/roleCard');

module.exports = class Track extends RoleCard {

    constructor (role) {
        super(role);

        this.meetings = {
            'Track': {
                type: 'Solo',
                times: Infinity,
                state: 'night',
                group: false,
                voteWeight: 1,
                canVote: true,
                canSeeVotes: true,
                action: {
                    labels: ['track'],
                    visit: true,
                    priority: 100,
                    do: (self) => {
                        let visits = {};
                        for (let action of self.game.actionQueue[0]) {
                            if (action.visit && action.actor == self.target && typeof action.target == 'object')
                                visits[action.target.name] = true;
                        }
                        visits = Object.keys(visits);
                        visits = visits.length ? visits.join(', ') : 'no one';
                        self.game.alertPlayer(`${self.target.name} visited ${visits} during the night`, self.actor, true, true);
                    }
                }
            }
        };
    }

}
