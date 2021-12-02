const RoleCard = require('../../../core/roleCard');

module.exports = class WinWithVillage extends RoleCard {

    constructor (role) {
        super(role);

        this.winCheck = {
            priority: 0,
            won: false,
            check: (self, counts, aliveCount) => {
                if (counts['village'] == aliveCount && aliveCount > 0)
                    self.won = 'village';
            }
        };
    }

}
