const RoleCard = require('../../../core/roleCard');

module.exports = class LynchRevenge extends RoleCard {

    constructor (role) {
        super(role);

        let meeting = {
            type: 'Solo',
            times: 1,
            state: 'sunset',
            group: false,
            voteWeight: 1,
            canVote: true,
            canSeeVotes: true,
            action: {
                labels: ['kill', 'lynchRevenge'],
                visit: false,
                priority: 1,
                do: (self) => {
                    if (!self.target.hasImmunity('kill'))
                        self.target.kill('lynchRevenge', false, self.actor, self.visit);
                }
            }
        };

        this.newStates = {
            sunset: {index: 1, length: 30000}
        };
        this.listeners = {
            state: {
                reaction: (state, day, stateCount) => {
                    if (state == 'sunset') {
                        for (let action of this.role.game.actionQueue[0]) {
                            if (action.target == this.role.player && action.hasLabel('lynch'))
                                this.role.meetings['Lynch Revenge'] = meeting;
                        }
                    }
                },
                aliveOnly: true,
                override: false
            }
        };
    }

}
