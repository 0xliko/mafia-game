const RoleCard = require('../../../core/roleCard');

module.exports = class ArmorGiver extends RoleCard {

    constructor (role) {
        super(role);

        this.meetings = {
            'Take Role': {
                type: 'Solo',
                times: Infinity,
                state: 'night',
                group: false,
                voteWeight: 1,
                canVote: true,
                canSeeVotes: true,
                targets: { include: ['dead'], exclude: [] },
                action: {
                    labels: ['takeRole'],
                    visit: true,
                    priority: 50,
                    do: (self) => {
                        const rolesGroup = require('../../../groups/roles');
                        let roleName = self.target.role.appearance.death;

                        self.actor.setRole(rolesGroup[roleName]);
                        self.game.alertPlayer(`You are now a ${roleName}`, self.actor, true);
                    }
                }
            }
        };
    }

}
