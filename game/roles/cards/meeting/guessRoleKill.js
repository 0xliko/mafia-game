const RoleCard = require('../../../core/roleCard');

module.exports = class GuessRoleKill extends RoleCard {

    constructor (role) {
        super(role);

        this.meetings = {
            'Guess': {
                type: 'Solo',
                times: Infinity,
                state: 'night',
                group: false,
                voteWeight: 1,
                canVote: true,
                canSeeVotes: true,
                action: {
                    labels: ['kill', 'guess'],
                    visit: true,
                    priority: 0,
                    do: (self) => {
                        if (
                            self.target.role.name == self.actor.role.roleToGuess &&
                            !self.target.hasImmunity('kill')
                        ) {
                            self.target.kill('basic', false, self.actor, self.visit);
                            delete self.actor.role.meetings['Guess'];
                        }
                    }
                }
            }
        };
    }

}
