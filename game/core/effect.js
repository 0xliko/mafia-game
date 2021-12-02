const shortid = require('shortid');

module.exports = class Effect {

    constructor (name, game) {
        this.id = shortid.generate();
        this.name = name;
        this.game = game;
        this.persistAfterDeath = false;
        this.listeners = {};
    }

    apply (player) {
        this.player = player;
        player.effects.push(this);

        for (let eventName in this.listeners)
            this.game.events.on(eventName, this.listeners[eventName]);
    }

    remove () {
        let index = this.player.effects.indexOf(this);
        if (index != -1)
            this.player.effects.splice(index, 1);

        for (let eventName in this.listeners)
            this.game.events.removeListener(eventName, this.listeners[eventName]);
    }

    speak (message) {return message}

    hear (message) {return message}

    seeVote (vote) {return vote}

    allowKill (how, instant, killer, visit) {return true}

}
