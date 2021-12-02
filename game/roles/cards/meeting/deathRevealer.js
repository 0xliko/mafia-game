const RoleCard = require('../../../core/roleCard');

module.exports = class DeathRevealer extends RoleCard {

    constructor (role) {
        super(role);

        this.meetings = {
            'Reveal On Death': {
                type: 'Solo',
                meetName: 'Reveal',
                times: Infinity,
                state: 'night',
                group: false,
                voteWeight: 1,
                canVote: true,
                canSeeVotes: true,
                action: {
                    labels: ['revealOnDeath'],
                    visit: false,
                    priority: -50,
                    do: (self) => {
                        self.actor.role.revealOnDeath = self.target;
                    }
                }
            }
        };
        this.listeners = {
            kill: {
                reaction: (player, how) => {
                    let self = this.role.player;
                    if (player == self && self.role.revealOnDeath && self.role.revealOnDeath.alive)
                        self.role.revealOnDeath.reveal();
                },
                aliveOnly: true,
                override: false
            }
        };
    }

}
