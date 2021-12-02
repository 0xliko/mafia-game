const shortid = require('shortid');
const meetingsGroup = require('../groups/meetings');
const itemsGroup = require('../groups/items');
const Action = require('../core/action');

module.exports = class Role {

    constructor (name, player) {
        this.name = name;
        this.player = player;
        this.game = player.game;
        this.events = this.game.events;
        this.roleCards = [];
        this.winCheck = { priority: 0, won: false, check: (self, counts) => {/* Set 'won' to group that you won as */} };
        this.appearance = {
            self: 'self',
            investigate: 'self',
            reveal: 'self',
            death: 'self',
            lynch: 'self'
        };
        this.revealOnDeath = true;
        this.revealed = false;
        this.revealedAs = null;
        this.startItems = [];
        this.effects = [];
        this.immunity = {};
        this.meetings = {};
        this.listeners = {};
        this.newStates = {};
        this.meetingMods = {};
    }

    init () {
        //Initialize role cards
        let newCards = [];

        for (let i in this.roleCards) {
            let card = new this.roleCards[i](this);
            card.init();
            newCards.push(card);
        }

        this.roleCards = newCards;

        //Set modifications of meeting cards
        for (let meetingName in this.meetingMods) {
            if (this.meetings[meetingName]) {
                for (let key in this.meetingMods[meetingName])
                    this.meetings[meetingName][key] = this.meetingMods[meetingName][key];
            }
        }

        //Hold starting items
        for (let item of this.startItems) {
            item.hold(this.player);
        }

        //Initialize appearances
        for (let key in this.appearance) {
            if (this.appearance[key] == 'self')
                this.appearance[key] = this.name;
        }

        //Modify game state lengths
        for (let stateName in this.newStates) {
            let state = this.newStates[stateName];
            this.game.addState(stateName, state.index, state.length);
        }
    }

    removeListeners (isDeath) {
        for (let card of this.roleCards) {
            for (let eventName in card.listeners) {
                let listener = card.listeners[eventName];
                if (!isDeath || listener.aliveOnly)
                    this.events.removeListener(eventName, listener.reaction);
            }
        }
    }

    meet () {
        for (let meetingName in this.meetings) {
            let options = this.meetings[meetingName];

            if (options.state == this.game.state && !options.disabled) {
                let joined = false;

                if (!options.unique) {
                    for (let meeting of this.game.meetings) {
                        let inMeeting = meeting.getMemberOption(this.player.id, 'player');

                        if (meeting.name == meetingName && meeting.group && options.group && !inMeeting) {
                            meeting.join(this.player, options);
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
                    meeting.join(this.player, options);
                }

                options.times--;
            }
        }
    }

    act (target, meeting, options) {
        if (meeting) {
            options = this.meetings[meeting.name];

            if (!options) {
                for (let item of this.player.items) {
                    options = item.meetings[meeting.name];

                    if (options)
                        break;
                }
            }
        }

        if (options) {
            options = options.action;
            options.visit = options.visit == true || options.visit == false ? options.visit : this.visit;
            let action = new Action(options.labels, this.player, target, options.visit, options.priority, options.do, meeting);

            if (meeting && meeting.instant)
                this.game.instantAction(action);
            else
                this.game.addToActionQueue(action, 0);
        }
    }

    speak (message) {
        for (let card of this.roleCards)
            message = card.speak(message);
        return message;
    }

    hear (message) {
        for (let card of this.roleCards)
            message = card.hear(message);
        return message;
    }

    seeVote (vote) {
        for (let card of this.roleCards)
            vote = card.seeVote(vote);
        return vote;
    }

}
