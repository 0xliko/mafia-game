const RoleCard = require('../../../core/roleCard');

module.exports = class WinAmongTwo extends RoleCard {

    constructor (role) {
        super(role);

        this.winCheck = {
            priority: 0,
            won: false,
            check: (self, counts) => {
                if (self.player.game.alivePlayers().length <= 2 && self.player.alive)
                    self.won = 'Serial Killer';
            }
        };
    }

}
