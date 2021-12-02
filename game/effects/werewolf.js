const Effect = require('../core/effect');
const Action = require('../core/action');
const utils = require('../core/utils');

module.exports = class Werewolf extends Effect {

    constructor (game, biter) {
        super('Werewolf', game);
        this.giver = biter;
        this.listeners = {
            state: (state, day, stateCount) => {
                if (state == 'night' && day % 2 == 1)
                    this.game.stateMods['full moon'] = true;
            },
            actionQueueNext: queue => {
                if (this.game.state == 'night' && this.game.day % 2 == 1) {
                    let nonMonsters = this.game.alivePlayers().filter(p => p.role.alignment != 'monsters' && p != this.player);
                    let target = utils.randArrVal(nonMonsters);
                    let werewolfKill = new Action(['kill', 'werewolf'], this.player, target, true, 0, (self) => {
                        if (!self.target.hasImmunity(['kill', 'werewolf']))
                            self.target.kill('basic', false, self.actor, self.visit);
                    });
                    this.game.addToActionQueue(werewolfKill, 0);
                }
            }
        };
    }

}
