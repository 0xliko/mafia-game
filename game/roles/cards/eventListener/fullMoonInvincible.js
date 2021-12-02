const RoleCard = require('../../../core/roleCard');

module.exports = class FullMoonInvincible extends RoleCard {

    constructor (role) {
        super(role);

        this.listeners = {
            state: {
                reaction: (state, day, stateCount) => {
                    if (state == 'night' && day % 2 == 1) {
                        this.role.game.stateMods['full moon'] = true;
                        this.role.immunity.kill = true;
                        this.role.game.alertPlayer('You are invincible tonight', this.role.player);
                    }
                },
                aliveOnly: true,
                override: false
            },
            beforeState: {
                reaction: (nextState) => {
                    if (this.role.game.stateMods['full moon'])
                        this.role.immunity.kill = false;
                },
                aliveOnly: true,
                override: false
            }
        };
    }

}
