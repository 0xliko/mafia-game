const Effect = require('../core/effect');
const utils = require('../core/utils');

module.exports = class Poison extends Effect {

    constructor (game) {
        super('Insanity', game);
        this.persistAfterDeath = true;
    }

    speak (message) {
        if (message.content) {
            let res = '';
            for (let i = 0; i < message.content.length; i++)
                res += Math.random() < 0.2 ? ' ' : 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'[utils.random(0, 51)];
            message.content = res;
        }
        return message;
    }

}
