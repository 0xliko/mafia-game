const shortid = require('shortid');
const meetingsGroup = require('../groups/meetings');

module.exports = class Item {

    constructor (name, game) {
        this.name = name;
        this.game = game;
        this.id = shortid.generate();
        this.holder = null;
        this.effects = [];
        this.immunity = {};
        this.meetings = {};
        this.listeners = {};
        this.dropOnDeath = true;
    }

    hold (player) {
        this.holder = player;
        this.holder.items.push(this);

        for (let eventName in this.listeners) {
            this.holder.events.on(eventName, this.listeners[eventName]);
        }

        for (let effect of this.effects)
            effect.apply(this.holder);

        this.game.events.emit('hold', this, player);
    }

    drop () {
        let itemArr = this.holder.items;
        itemArr.splice(itemArr.indexOf(this), 1);

        for (let eventName in this.listeners)
            this.holder.events.removeListener(eventName, this.listeners[eventName]);

        for (let effect of this.effects)
            effect.remove();
    }

    meet () {
        for (let meetingName in this.meetings) {
            let options = this.meetings[meetingName];

            if (options.state == this.game.state) {
                let joined = false;

                if (!options.unique) {
                    for (let meeting of this.game.meetings) {
                        let inMeeting = meeting.getMemberOption(this.holder.id, 'player');

                        if (meeting.name == meetingName && meeting.group && options.group && !inMeeting) {
                            meeting.join(this.holder, options);
                            joined = true;
                            break;
                        }
                        else if (meeting.name == meetingName && inMeeting) {
                            joined = true;
                            break;
                        }
                    }
                }

                if (!joined) {
                    let meeting = new meetingsGroup[options.type](meetingName, this.game);
                    meeting.join(this.holder, options);
                }

                options.times--;
            }
        }
    }

    speak (message) {return message}

    hear (message) {return message}

    seeVote (vote) {return vote}

    allowKill (how, instant, killer, visit, absolute) {return true}

}
