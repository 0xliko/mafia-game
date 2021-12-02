const RoleCard = require('../../../core/roleCard');
const Werewolf = require('../../../effects/werewolf');

module.exports = class BitingWolf extends RoleCard {

    constructor (role) {
        super(role);

        this.meetings = {
            'Wolf Bite': {
                type: 'Solo',
                times: Infinity,
                state: 'night',
                group: false,
                voteWeight: 1,
                canVote: true,
                canSeeVotes: true,
                action: {
                    labels: ['bite', 'lycan', 'monster'],
                    visit: true,
                    priority: -50,
                    do: (self) => {
                        let werewolf = new Werewolf(self.game, self.actor);
                        werewolf.apply(self.target);
                        self.game.alertPlayer(`You bit ${self.target.name}`, self.actor, true);
                    }
                }
            }
        };
    }

}
