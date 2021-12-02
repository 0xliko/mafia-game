const RoleCard = require('../../../core/roleCard');

module.exports = class MeetingMafia extends RoleCard {

    constructor (role) {
        super(role);

        this.winCheck = {
            priority: -10,
            won: false,
            check: (self, counts) => {
                if (this.role.lynched)
                    self.won = 'jester';
            }
        };
        this.listeners = {
            kill: {
                reaction: (player, how) => {
                    if (player == this.role.player && how == 'lynch')
                        this.role.lynched = true;
                },
                aliveOnly: true,
                override: false
            }
        };
    }

}
