const RoleCard = require('../../../core/roleCard');
const Armor = require('../../../items/armor');

module.exports = class ArmorGiver extends RoleCard {

    constructor (role) {
        super(role);

        this.meetings = {
            'Give Armor': {
                type: 'Solo',
                times: Infinity,
                state: 'night',
                group: false,
                voteWeight: 1,
                canVote: true,
                canSeeVotes: true,
                action: {
                    labels: ['giveItem', 'armor'],
                    visit: true,
                    priority: -50,
                    do: (self) => {
                        self.game.alertPlayer('Someone gave you armor', self.target, true);
                        let armor = new Armor(self.game);
                        armor.hold(self.target);
                    }
                }
            }
        };
    }

}
