const RoleCard = require('../../../core/roleCard');

module.exports = class EclipseInvincible extends RoleCard {

    constructor (role) {
        super(role);

        this.listeners = {
            stateMods: {
                reaction: (mods) => {
                    if (mods.eclipse) {
                        this.role.immunity.kill = true;
                        this.role.game.alertPlayer('You are invincible today', this.role.player);
                    }
                },
                aliveOnly: true,
                override: false
            },
            beforeState: {
                reaction: (nextState) => {
                    if (this.role.game.stateMods.eclipse && nextState != 'sunset')
                        this.role.immunity.kill = false;
                },
                aliveOnly: true,
                override: false
            }
        };
    }

}
