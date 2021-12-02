const RoleCard = require('../../../core/roleCard');
const Poison = require('../../../effects/poison');

module.exports = class Poisoner extends RoleCard {

    constructor (role) {
        super(role);

        this.meetings = {
            'Poison': {
                type: 'Solo',
                times: Infinity,
                state: 'night',
                group: false,
                voteWeight: 1,
                canVote: true,
                canSeeVotes: true,
                action: {
                    labels: ['poison'],
                    visit: true,
                    priority: -50,
                    do: (self) => {
                        let poison = new Poison(self.game, self.actor);
                        poison.apply(self.target);
                        self.game.alertPlayer('You have been poisoned!', self.target, true);
                    }
                }
            }
        };
    }

}
