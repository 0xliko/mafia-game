const RoleCard = require('../../../core/roleCard');
const Action = require('../../../core/action');
const Insanity = require('../../../effects/insanity');

module.exports = class KillKiller extends RoleCard {

    constructor (role) {
        super(role);

        this.listeners = {
            actionQueueNext: {
                reaction: (queue) => {
                    let makeInsane = new Action(['insane'], this.role.player, null, false, 100, (self) => {
                        for (let action of queue) {
                            if (action.visit && action.target == this.role.player && !action.actor.hasImmunity('insanity')) {
                                let insanity = new Insanity(self.game);
                                insanity.apply(action.actor);
                                self.game.alertPlayer('Your mind decends into madness', action.actor, true);
                            }
                        }
                    });
                    this.role.game.addToActionQueue(makeInsane);
                },
                aliveOnly: true,
                override: false
            }
        };
    }

}
