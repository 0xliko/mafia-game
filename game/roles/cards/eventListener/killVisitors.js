const RoleCard = require('../../../core/roleCard');
const Action = require('../../../core/action');

module.exports = class KillVisitors extends RoleCard {

    constructor (role) {
        super(role);

        this.listeners = {
            actionQueueNext: {
                reaction: (queue) => {
                    let detectVisitors = new Action(['detectVisitors'], this.role.player, null, false, -95, (self) => {
                        for (let action of queue) {
                            if (action.visit && action.target == this.role.player) {
                                let killVisitor = new Action(['kill'], this.role.player, action.actor, false, 0, (self) => {
                                    if (!self.target.hasImmunity('kill'))
                                        self.target.kill('basic', false, self.actor, self.visit);
                                });
                                self.game.addToActionQueue(killVisitor);
                            }
                        }
                    });
                    this.role.game.addToActionQueue(detectVisitors);
                },
                aliveOnly: true,
                override: false
            }
        };
    }

}
