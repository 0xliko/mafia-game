const RoleCard = require('../../../core/roleCard');

module.exports = class WinWithMafia extends RoleCard {

    constructor (role) {
        super(role);

        this.winCheck = {
            priority: 0,
            won: false,
            check: (self, counts, aliveCount) => {
                if (counts['mafia'] >= aliveCount / 2 && aliveCount > 0)
                    self.won = 'mafia';
            }
        };
    }

}
