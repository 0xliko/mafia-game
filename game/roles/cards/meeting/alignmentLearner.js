const RoleCard = require('../../../core/roleCard');
const alignments = require('../../../groups/alignments');

module.exports = class AlignmentLearner extends RoleCard {

    constructor (role) {
        super(role);

        this.meetings = {
            'Learn Alignment': {
                type: 'Solo',
                meetName: 'Investigate',
                times: Infinity,
                state: 'night',
                voteWeight: 1,
                canVote: true,
                canSeeVotes: true,
                action: {
                    labels: ['investigate', 'alignment'],
                    visit: true,
                    priority: -2,
                    do: (self) => {
                        let align = alignments[self.target.role.appearance.investigate];
                        if (align == 'independent')
                            align = 'neither the village nor the mafia';
                        else
                            align = `the ${align}`;

                        self.game.alertQueue.push({
                            msg: `You learn that ${self.target.name} is sided with ${align}`,
                            recipients: self.meeting.members.map(m => m.player)
                        });
                    }
                }
            }
        };
    }

}
