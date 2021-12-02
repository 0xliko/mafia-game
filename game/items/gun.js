const Item = require('../core/item');
const utils = require('../core/utils');

module.exports = class Gun extends Item {

    constructor (game, reveal) {
        super('Gun', game);

        this.reveal = reveal;
        this.meetings = {
            'Shoot': {
                type: 'SoloInstant',
                times: Infinity,
                state: 'day',
                group: false,
                voteWeight: 1,
                canVote: true,
                canSeeVotes: true,
                unique: false,
                action: {
                    labels: ['kill', 'gun'],
                    visit: true,
                    do: (self) => {
                        let reveal = this.reveal; //-1: random, 0: no reveal, 1: reveal
                        if (this.reveal == -1)
                            reveal = utils.random(0, 1);

                        if (reveal)
                            self.game.sendAlert(`${self.actor.name} pulls a gun and shoots at ${self.target.name}!`);
                        else
                            self.game.sendAlert(`Someone fires a gun at ${self.target.name}!`);

                        if (!self.target.hasImmunity(['kill', 'gun']))
                            self.target.kill('gun', true, self.actor, self.visit);

                        this.drop();
                    }
                }
            }
        };
    }

}
