const shortid = require('shortid');
const utils = require('../core/utils');
const Message = require('../core/message');

module.exports = class Meeting {

    constructor (name, game) {
        this.name = name;
        this.id = shortid.generate();
        this.game = game;
        this.group = false;
        this.members = [];
        this.anonymous = false;
        this.speech = false;
        this.voting = false;
        this.mandatory = game.setup.mustAct || game.noKillMustAct;
        this.instant = false;
        this.targets = { include: [], exclude: [] };
        this.targetType = 'player';
        this.targetsGenerated = false;
        this.votes = {};
        this.messages = [];
        this.totalVoters = 0;
        this.finished = false;

        game.meetings.push(this);
    }

    join (player, options) {
        let member = {
            player: player,
            voteWeight: options.voteWeight || 1,
            canVote: options.canVote,
            canSeeSpeech: options.canSeeSpeech,
            canSeeVotes: options.canSeeVotes,
            canTalk: options.canTalk,
            leader: options.leader,
            speechAbilities: options.speechAbilities || [],
            meetName: options.meetName
        };

        this.members.push(member);

        let props = ['group', 'speech', 'voting', 'targets', 'targetType'];
        for (let key in options) {
            if (props.indexOf(key) != -1)
                this[key] = options[key];
        }

        if (options.mandatory)
            this.mandatory = true;

        if (options.canVote)
            this.totalVoters++;

        player.history[this.game.stateCount].meetings[this.id] = {
            id: this.id,
            name: member.meetName || this.displayName || this.name,
            instant: this.instant,
            members: this.members,
            messages: this.name == 'Pregame' ? this.messages : [],
            votes: {},
            voting: this.voting,
            canVote: member.canVote,
            group: this.group,
            targetType: this.targetType
        };

        return member;
    }

    leave (player) {
        let member, index;

        for (let i in this.members) {
            if (this.members[i].player == player) {
                member = this.members[i];
                index = i;
                break;
            }
        }

        if (member) {
            this.members.splice(index, 1);

            if (member.canVote) {
                delete this.votes[player.id];
                this.totalVoters--;
            }
        }

        if (this.members.length <= 0)
            this.game.meetings.splice(this.game.meetings.indexOf(this), 1);
    }

    getMemberOption (id, option) {
        for (let member of this.members) {
            if (member.player.id == id)
                return member[option];
        }
    }

    getMeetingInfo (member) {
        if (!this.targetsGenerated)
            this.generateTargets();

        return {
            id: this.id,
            name: member.meetName || this.displayName || this.name,
            instant: this.instant,
            targetType: this.targetType,
            canVote: member.canVote,
            canTalk: member.canTalk,
            group: this.group,
            speech: this.speech,
            voting: this.voting,
            votes: {},
            members: this.members.map(member => {
                return {
                    id: member.player.id,
                    canVote: member.canVote
                }
            }),
            targets: this.targets.map(target => {
                if (this.targetType == 'player' && target != '*')
                    return target.id;
                else
                    return target;
            }),
            speechAbilities: member.speechAbilities.map(ability => {
                return {
                    name: ability.name,
                    targets: this.parseTargetDefinitions(
                        ability.targets,
                        ability.targetType,
                        this.members.map(m => m.player),
                        true
                    ),
                    targetType: ability.targetType
                };
            }),
            messages: []
        };
    }

    parseTargetDefinitions (targets, targetType, players, idOnly) {
        let newTargets = {};
        let playerList = [];
        let roleList = {};
        let finalTargets = [];

        for (let i in players) {
            let player = players[i];

            for (let type of ['include', 'exclude']) {
                for (let tag of targets[type]) {
                    let include = type == 'include';

                    switch (tag) {
                        case 'all':
                            newTargets[i] = include;
                            break;
                        case 'self':
                        case 'members':
                            if (this.members.map(m => m.player).indexOf(player) != -1)
                                newTargets[i] = include;
                            break;
                        case 'village':
                        case 'mafia':
                        case 'monsters':
                        case 'independent':
                            if (player.role.alignment == tag)
                                newTargets[i] = include;
                            break;
                        case 'alive':
                            if (player.alive)
                                newTargets[i] = include;
                            break;
                        case 'dead':
                            if (!player.alive)
                                newTargets[i] = include;
                            break;
                        default:
                            if (player.id == tag)
                                newTargets[i] = include;
                    }
                }
            }
        }

        for (let i in newTargets) {
            if (newTargets[i]) {
                if (this.targetType == 'player')
                    playerList.push(idOnly ? this.game.players[i].id : this.game.players[i]);
                else {
                    //only get unique role names
                    roleList[this.game.players[i].role.name] = true;
                }
            }
        }

        if (targetType == 'player')
            finalTargets = playerList;
        else
            finalTargets = Object.keys(roleList);

        return finalTargets;
    }

    generateTargets () {
        let playerOrRole = this.targetType == 'player' || this.targetType == 'role';
        this.targetsGenerated = true;

        if (playerOrRole) {
            this.targets = this.parseTargetDefinitions(this.targets, this.targetType, this.game.players);
            if (!this.mandatory)
                this.targets.push('*');
        }
        else if (this.targets.indexOf('No') != -1 && this.game.setup.mustAct)
            this.targets.splice(this.targets.indexOf('No'), 1);
    }

    vote (voter, selection) {
        if (this.getMemberOption(voter.id, 'canVote') && voter.alive && this.voting) {
            let target;

            if (this.targetType == 'player') {
                if (selection != '*') {
                    let player = this.game.getPlayer(selection);
                    if (this.targets.indexOf(player) != -1)
                        target = selection;
                }
                else if (!this.mandatory)
                    target = '*';
            }
            else if (this.targetType == 'role') {
                if (this.targets.indexOf(selection) != -1)
                    target = selection;
            }
            else {
                target = selection;
            }

            if (target) {
                let time = this.game.getTimeFormatted();

                this.votes[voter.id] = target;
                this.game.record('vote', {
                    voter: voter,
                    meeting: this,
                    target: target,
                    time: time
                });

                for (let member of this.members) {
                    if (member.canSeeVotes)
                        member.player.seeVote({voter: voter, target: target, meeting: this, time: time});
                }

                if (!this.instant)
                    this.game.checkMeetingsReady();
                else if (Object.keys(this.votes).length == this.totalVoters)
                    this.finish();
            }
        }
    }

    unvote (voter) {
        let voteExists = this.votes[voter.id];
        if (voteExists != null && !this.instant) {
            delete this.votes[voter.id];
            this.game.meetingsReady--;

            let time = this.game.getTimeFormatted();
            this.game.record('unvote', {
                voter: voter,
                meeting: this,
                time: time
            });

            for (let member of this.members) {
                if (member.canSeeVotes)
                    member.player.seeUnvote(voter, this, time);
            }
        }
    }

    finish (endState) {
        this.finished = true;
        console.log(this.votes,"votes",this)
        if (this.voting) {
            let count = {};
            let finalTarget;

            for (let voterId in this.votes) {
                let target = this.votes[voterId];
                if (!count[target])
                    count[target] = 0;

                count[target] += this.getMemberOption(voterId, 'voteWeight');
            }

            let highest = {targets: [], votes: 0};
            console.log(count,"count info")
            /// get target who has highest vote & highest votes
            // TODO cryp-94
            for (let target in count) {
                if (count[target] > highest.votes)
                    highest = {targets: [target], votes: count[target]};
                else if (count[target] == highest.votes)
                    highest.targets.push(target);
            }
            // modified by lyu.
            // remove random player kill
            if(highest.votes > this.members.filter(member=>member.player.alive).length / 2  && highest.targets[0] != '*'){
               finalTarget = highest.targets[0];
            } else{
                finalTarget = '*';
            }
            /*if (highest.targets.length > 1 && highest.votes > 0) { //tie vote
                finalTarget = utils.randArrVal(highest.targets);
            }
            else if (highest.votes > 0) { //winning vote
                finalTarget = highest.targets[0];
            }
            else { //no votes

                // if (this.mandatory) {
                //     finalTarget = utils.randArrVal(this.targets);
                // }
                // else
                    finalTarget = '*';
            }*/

            if (finalTarget != '*') {
                let actor;

                for (let member of this.members) {
                    if (member.leader) {
                        actor = member.player;
                        break;
                    }
                }

                if (!actor && Object.keys(this.votes).length > 0)
                    actor = this.game.getPlayer(Object.keys(this.votes)[0]);
                else if (!actor)
                    actor = utils.randArrVal(this.members).player;

                if (this.targetType == 'player' && typeof finalTarget == 'string')
                    finalTarget = this.game.getPlayer(finalTarget);

                if (finalTarget)
                    actor.act(finalTarget, this);
            }
        }

        if (!endState)
            this.game.meetings.splice(this.game.meetings.indexOf(this), 1);
    }

    speak (message) {
        if (
            this.getMemberOption(message.original_sender.id, 'canTalk') &&
            this.speech &&
            (this.members.length > 1 || this.name == 'Pregame')
        )  {
            let recipients = [];
            let whisper = false;
            let leak = false;

            if (
                message.type == 'whisper' &&
                this.game.setup.whispers &&
                message.recipient != message.sender &&
                message.recipient.alive
            ) {
                whisper = true;
                message.recipients.push(message.sender.id);
            }
            else if (message.type == 'whisper')
                message.recipients = [];

            if (whisper && utils.random(1, 100) <= this.game.setup.leakPercentage)
                leak = true;

            if (message.recipients == '*' || leak) {
                for (let member of this.members) {
                    if (member.canSeeSpeech)
                        recipients.push(member.player);
                }
            }
            else {
                for (let recipient of message.recipients) {
                    if (this.getMemberOption(recipient, 'canSeeSpeech'))
                        recipients.push(this.game.getPlayer(recipient));
                }
            }

            if (recipients.length) {
                message = new Message(this.game, message.content, message.sender, this, recipients, message.server, whisper, message.recipient);
                this.messages.push(message);
                message.send();
                this.game.events.emit('message', message.content, message.sender, this);
            }
        }
    }

    quote (senderId, id) {
        if (this.getMemberOption(senderId, 'canTalk') && this.speech && String(id).length == 9 || String(id).length == 10) {
            for (let member of this.members)
                member.player.emit('quote', {
                    id: String(id),
                    sender: this.game.stateMods.eclipse ? null : senderId,
                    meeting: this.id,
                    time: this.game.getTimeFormatted()
                });
        }
    }

    sendAlert (msg) {
        let recipients = this.members.map(member => member.player);
        let message = new Message(this.game, msg, null, this, recipients, true);
        message.send();
    }

}
