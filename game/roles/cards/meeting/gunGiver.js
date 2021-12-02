const RoleCard = require('../../../core/roleCard');
const Gun = require('../../../items/gun');

module.exports = class GunGiver extends RoleCard {

    constructor (role) {
        super(role);

        this.meetings = {
            'Give Gun': {
                type: 'Solo',
                times: Infinity,
                state: 'night',
                group: false,
                voteWeight: 1,
                canVote: true,
                canSeeVotes: true,
                action: {
                    labels: ['giveItem', 'gun'],
                    visit: true,
                    priority: -50,
                    do: (self) => {
                        let gun = new Gun(self.game, -1);
                        gun.hold(self.target);
                        self.game.alertPlayer('Someone gave you a gun', self.target, true);
                    }
                }
            }
        };
    }

}
