const RoleCard = require('../../../core/roleCard');

module.exports = class EclipseOnDeath extends RoleCard {

    constructor (role) {
        super(role);

        this.listeners = {
            kill: {
                reaction: (player, how) => {
                    if (player == this.role.player)
                        this.role.causeEclipse = true;
                },
                aliveOnly: true,
                override: false
            },
            state: {
                reaction: (state, day, stateCount) => {
                    if (this.role.causeEclipse && state == 'day') {
                        this.role.game.stateMods.eclipse = true;
                        delete this.role.causeEclipse;
                    }
                },
                aliveOnly: false,
                override: false
            }
        };
    }

}
