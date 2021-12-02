const RoleCard = require('../../../core/roleCard');

module.exports = class MakeInno extends RoleCard {

    constructor (role) {
        super(role);

        this.meetings = {
            'Make Innocent': {
                type: 'Solo',
                times: Infinity,
                state: 'night',
                voteWeight: 1,
                canVote: true,
                canSeeVotes: true,
                targets: {include: ['mafia'], exclude: ['self']},
                action: {
                    labels: ['makeInno'],
                    visit: true,
                    priority: -50,
                    do: (self) => {
                        self.actor.innoTarget = self.target;
                        self.actor.targetOldAppearance = self.target.role.appearance.investigate;
                        self.target.role.appearance.investigate = 'Villager';
                    }
                }
            }
        };
        this.listeners = {
            state: {
                reaction: (state, day, stateCount) => {
                    if (this.role.player.innoTarget) {
                        this.role.player.innoTarget.role.appearance.investigate = this.role.player.targetOldAppearance;
                        delete this.role.player.innoTarget;
                        delete this.role.player.targetOldAppearance;
                    }
                },
                aliveOnly: false,
                override: false
            }
        };
    }

}
