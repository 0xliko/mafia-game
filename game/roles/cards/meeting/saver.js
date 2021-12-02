const RoleCard = require('../../../core/roleCard');

module.exports = class Saver extends RoleCard {

    constructor (role) {
        super(role);

        this.meetings = {
            'Save': {
                type: 'SoloSaver',
                times: Infinity,
                state: 'night',
                group: false,
                voteWeight: 1,
                canVote: true,
                canSeeVotes: true,
                action: {
                    labels: ['save'],
                    visit: true,
                    priority: -94,
                    do: (self) => {
                        for (let action of self.game.actionQueue[0]) {
                            if (
                                action.hasLabel('kill') &&
                                action.target == self.target &&
                                !action.hasLabel('absolute')
                            ) {
                                action.nullify();
                            }
                        }
                    }
                }
            }
        };
    }

}
