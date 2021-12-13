const shortid = require('shortid');
const deathmessages = require('../groups/deathmessages');
const Message = require('./message');

module.exports = class Player {

    constructor(user, game) {
        this.name = user.name;
        this.id = shortid.generate();
        this.avatar = user.avatar;
        this.profileImg = user.profileImg;
        this.game = game;
        this.events = game.events;
        this.role = null;
        this.items = [];
        this.effects = [];
        this.alive = true;
        this.lastWill = '';
        this.history = [
            {
                name: 'pregame',
                meetings: {/*
                    'meetingId': {
                        id: 'meetingId',
                        name: 'name',
                        instant: boolean,
                        members: [],
                        messages: [],
                        votes: {},
                        voting: boolean,
                        canVote: boolean,
                        group: true,
                        targetType: ''
                    }
                */
                },
                alerts: [],
                deaths: [],
                revives: [],
                stateMods: {}
            }
        ];

        this.setUser(user);
    }

    setUser(user) {
        if (this.user && this.user.socket) {
            this.user.emit('redirect');
            this.user.socket.disconnect();
        }

        this.user = user;
        user.player = this;
    }

    emit() {
        if (this.user.socket)
            this.user.socket.emit(...arguments);
    }

    setRole(role) {
        this.removeRole();
        this.role = new role(this);
        this.role.init();
        this.emit('role', this.role.appearance.self);
    }

    removeRole() {
        if (this.role) {
            this.role.removeListeners(false);
            this.role = null;
        }
    }

    hasImmunity(types) {
        let immune;
        if (!Array.isArray(types))
            types = [types];

        for (let type of types) {
            if (!immune)
                immune = this.role.immunity[type];

            if (!immune) {
                for (let item of this.items) {
                    if (item.immunity[type]) {
                        immune = true;
                        break;
                    }
                }
            } else
                break;
        }

        return immune;
    }

    hasEffect(effectName) {
        for (let effect of this.effects) {
            if (effect.name == effectName)
                return true;
        }
        return false;
    }

    kick() {
        this.alive = false;
        this.game.resetLastDeath = true;
        //Create and send deathmessage
        let lastWill, deathmessage = `${this.name} was kicked`;
        if (this.game.setup.lastWill)
            lastWill = this.lastWill ? `${this.name} left a will: ${this.lastWill}` : `${this.name} did not leave a will`;

        if (true) {
            this.game.sendAlert(deathmessage);
            this.game.lastDeathMessage = deathmessage;
            if (lastWill)
                this.game.sendAlert(lastWill);
        }

        //Send to the clients that the player is dead
        this.game.emit('kick', this.id, true);

        //Reveal the player's role to the clients
        if (this.role.revealOnDeath && !this.game.setup.noReveal)
            this.reveal(true, false, true);

        //Emit the event and then remove the listeners
        // this.events.emit('kill', this, how, killer, visit, absolute, instant);
        this.role.removeListeners(true);

        //Drop items that you don't hold after death
        for (let item of this.items.slice()) {
            if (item.dropOnDeath)
                item.drop();
        }

        //Remove all effects that don't persist after death
        for (let effect of this.effects.slice()) {
            if (!effect.persistAfterDeath)
                effect.remove();
        }

        //Remove future meetings
        for (let meetingName in this.role.meetings) {
            if (meetingName == 'Village') {
                this.role.meetings['Village'].canTalk = false;
                this.role.meetings['Village'].canVote = false;
            } else
                this.role.meetings[meetingName].disabled = true;
        }

        //Update current meetigns if kill is instant
        if (true) {
            for (let meeting of this.game.meetings) {
                if (!meeting.finished) {
                    let targetIndex = meeting.targets.indexOf(this);
                    if (targetIndex != -1) {
                        meeting.targets.splice(targetIndex, 1);

                        for (let voterId in meeting.votes) {
                            if (meeting.votes[voterId] == this.id) {
                                delete meeting.votes[voterId];
                            }
                        }
                    }

                    meeting.leave(this);
                }
            }
        }

        //Send after death event
        // this.game.events.emit('afterKill', this, how, killer, visit, absolute, instant);

        //Record in players' histories
        for (let player of this.game.players) {
            if (player.history[this.game.stateCount])
                player.history[this.game.stateCount].deaths.push(this.id);
        }

    }

    kill(how, instant, killer, visit, absolute) {
        console.log(this.name, this.id, "was killed")
        let confirmKill = this.alive;
        if (confirmKill) {
            for (let obj of this.items.concat(this.effects)) {
                confirmKill = obj.allowKill(how, instant, killer, visit, absolute);
                if (!confirmKill)
                    break;
            }
        }
        if (confirmKill) {
            //Change alive state, reset meteor counter
            this.alive = false;
            this.game.resetLastDeath = true;

            //Create and send deathmessage
            let lastWill, deathmessage = deathmessages(how, this.name);

            if (this.game.setup.lastWill)
                lastWill = this.lastWill ? `${this.name} left a will: ${this.lastWill}` : `${this.name} did not leave a will`;

            if (instant) {
                this.game.sendAlert(deathmessage);
                this.game.lastDeathMessage = deathmessage;
                if (lastWill)
                    this.game.sendAlert(lastWill);
            } else {
                this.game.alertQueue.push({msg: deathmessage});
                if (lastWill)
                    this.game.alertQueue.push({msg: lastWill});
            }

            //Send to the clients that the player is dead
            this.game.emit('dead', this.id, instant);

            //Reveal the player's role to the clients
            if (this.role.revealOnDeath && !this.game.setup.noReveal)
                this.reveal(true, how == 'lynch', instant);

            //Emit the event and then remove the listeners
            this.events.emit('kill', this, how, killer, visit, absolute, instant);
            this.role.removeListeners(true);

            //Drop items that you don't hold after death
            for (let item of this.items.slice()) {
                if (item.dropOnDeath)
                    item.drop();
            }

            //Remove all effects that don't persist after death
            for (let effect of this.effects.slice()) {
                if (!effect.persistAfterDeath)
                    effect.remove();
            }

            //Remove future meetings
            for (let meetingName in this.role.meetings) {
                if (meetingName == 'Village') {
                    this.role.meetings['Village'].canTalk = false;
                    this.role.meetings['Village'].canVote = false;
                } else
                    this.role.meetings[meetingName].disabled = true;
            }

            //Update current meetigns if kill is instant
            if (instant) {
                for (let meeting of this.game.meetings) {
                    if (!meeting.finished) {
                        let targetIndex = meeting.targets.indexOf(this);
                        if (targetIndex != -1) {
                            meeting.targets.splice(targetIndex, 1);

                            for (let voterId in meeting.votes) {
                                if (meeting.votes[voterId] == this.id) {
                                    delete meeting.votes[voterId];
                                }
                            }
                        }

                        meeting.leave(this);
                    }
                }
            }

            //Send after death event
            this.game.events.emit('afterKill', this, how, killer, visit, absolute, instant);

            //Record in players' histories
            for (let player of this.game.players) {
                if (player.history[this.game.stateCount])
                    player.history[this.game.stateCount].deaths.push(this.id);
            }
        }
    }

    revive() {
        this.setRole(this.role.constructor);
        this.game.sendAlert(`${this.name} has come back to life!`);

        for (let player of this.game.players)
            player.history[this.game.stateCount].revives.push(this.id);
    }

    reveal(death, lynch, instant) {
        let appearance = this.role.appearance;
        let roleName = death ? lynch ? appearance.lynch : appearance.death : appearance.reveal;
        let revealMsg = `${this.name}'s role is ${roleName}`;
        this.game.emit('reveal', this.id, roleName);
        this.role.revealed = true;
        this.role.revealedAs = roleName;

        if (instant)
            this.game.sendAlert(revealMsg);
        else
            this.game.alertQueue.push({msg: revealMsg});
    }

    meet() {
        this.role.meet();
        for (let item of this.items)
            item.meet();
    }

    act(target, meeting) {
        this.role.act(target, meeting);
    }

    speak(message) {
        if (this.role)
            message = this.role.speak(message);

        if (message) {
            for (let item of this.items)
                message = item.speak(message);
        }

        if (message) {
            for (let effect of this.effects)
                message = effect.speak(message);
        }

        if (message) {
            if (!message.recipients && message.type != 'whisper')
                message.recipients = '*';
            else if (!message.recipients) {
                message.recipient = this.game.getPlayer(message.recipient);
                if (message.recipient)
                    message.recipients = [message.recipient.id];
            }

            if (message.recipients) {
                message.meeting = this.game.getMeeting(message.meeting);

                if (message.meeting)
                    message.meeting.speak(message);
            }
        }
    }

    hear(message) {
        if (this.role)
            message = this.role.hear(message);

        if (message) {
            for (let item of this.items)
                message = item.hear(message);
        }

        if (message) {
            for (let effect of this.effects)
                message = effect.hear(message);
        }

        if (message && this.game.stateMods.eclipse && message.sender) {
            message = Object.assign({}, message);
            delete message.sender;
        }

        if (message) {
            let parsedMessage = {
                id: message.id,
                meeting: message.meeting ? message.meeting.id : null,
                content: message.content,
                sender: message.sender ? message.sender.id : null,
                server: message.server,
                whisper: message.whisper,
                target: message.whisper ? message.target.id : null,
                time: message.time
            };

            this.emit('msg', parsedMessage);

            let state = this.history[this.game.stateCount];
            if (state && message.meeting && message.meeting.name != 'Pregame')
                state.meetings[message.meeting.id].messages.push(message);
            else if (state && !message.meeting)
                state.alerts.push(message);
        }
    }

    seeVote(vote) {
        if (this.role)
            vote = this.role.seeVote(vote);

        for (let item of this.items)
            vote = item.seeVote(vote);

        for (let effect of this.effects)
            vote = effect.seeVote(vote);

        if (this.game.stateMods.eclipse && vote.voter != this)
            vote = null;

        if (vote) {
            this.emit('vote', {voter: vote.voter.id, target: vote.target, meeting: vote.meeting.id, time: vote.time});
            this.history[this.game.stateCount].meetings[vote.meeting.id].votes[vote.voter.id] = vote.target;
        }
    }

    seeUnvote(voter, meeting, time) {
        if (!this.game.stateMods.eclipse || voter == this) {
            this.emit('unvote', voter.id, meeting.id, time);
            delete this.history[this.game.stateCount].meetings[meeting.id].votes[voter.id];
        }
    }

}
