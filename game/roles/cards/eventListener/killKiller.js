const RoleCard = require('../../../core/roleCard');

module.exports = class KillKiller extends RoleCard {

    constructor (role) {
        super(role);

        this.listeners = {
            kill: {
                reaction: (player, how, killer, visit) => {
                    if (visit && killer && player == this.role.player) {
                        if (!killer.hasImmunity(['kill', 'bomb']))
                            killer.kill('bomb', false, this.role.player, false);
                    }
                },
                aliveOnly: true,
                override: false
            }
        };
    }

}
