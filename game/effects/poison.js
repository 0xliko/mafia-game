const Effect = require('../core/effect');
const Action = require('../core/action');

module.exports = class Poison extends Effect {

    constructor (game, poisoner) {
        super('Poison', game);
        this.giver = poisoner;
    }

    apply (target) {
        super.apply(target);

        let poisonKill = new Action(['kill', 'poison'], this.giver, this.player, false, 0, (self) => {
            if (!self.target.hasImmunity(['kill', 'poison']))
                self.target.kill('poison', false, self.actor, self.visit);
        });
        poisonKill.effect = this;
        this.game.addToActionQueue(poisonKill, 2);
    }

    remove() {
        let poisonKill = this.game.findOneInActionQueue(action => action.effect == this);
        if (poisonKill.action)
            poisonKill.action.nullify();

        super.remove();
    }

}
