const RoleCard = require('../../../core/roleCard');
const alignments = require('../../../groups/alignments');

module.exports = class RoleLearner extends RoleCard {

    constructor (role) {
        super(role);

        this.meetings = {
            'Learn Role': {
                type: 'Solo',
                times: Infinity,
                state: 'night',
                voteWeight: 1,
                canVote: true,
                canSeeVotes: true,
                action: {
                    labels: ['investigate', 'role'],
                    visit: true,
                    priority: -2,
                    do: (self) => {
                        let roleName = self.target.role.appearance.investigate;

                        self.game.alertQueue.push({
                            msg: `You learn that ${self.target.name}'s role is ${roleName}`,
                            recipients: self.meeting.members.map(m => m.player)
                        });
                    }
                }
            }
        };
    }

}
