const events = require('events');
const shortid = require('shortid');
const global = require('../../global');
const utils = require('./utils');
const models = require('../../db/models');
const db = require('../../db/db');
const meetingsGroup = require('../groups/meetings');
const rolesGroup = require('../groups/roles');
const stateModMessages = require('../groups/stateModMessages');
const Player = require('./player');
const Message = require('./message');
const Timer = require('./timer');
const Action = require('./action');

module.exports = class Game {

    constructor (setup, isPrivate, ranked, emojis,uuid) {
        this.uuid = uuid;
        this.id = shortid.generate();
        this.private = ranked ? false : isPrivate;
        this.ranked = ranked;
        this.setup = setup;
        this.events = new events();
        this.started = false;
        this.finished = false;
        this.createTime = Date.now();
        this.startTime = 0;
        this.state = 'pregame';
        this.day = 0;
        this.stateCount = 0;
        this.stateMods = {};
        this.players = [];
        this.meetings = [];
        this.kickPhase = false;
        this.kickPhaseCountDownStarted = false;
        this.actionQueue = {
            0: []
        };
        this.alertQueue = [];
        this.winQueue = [];
        this.pastAlerts = [];
        this.lastDeathMessage = null;
        this.timers = {main: null};
        this.syncInterval = null;
        this.meetingsReady = 0;
        this.records = {/*
            'day-1': [
                '0:00 SomeGuy has died.',
                '0:03 SomeOtherGuy (village): wow'
            ]
        */};
        this.lastDeath = 0;
        this.resetLastDeath = false;
        this.noKillMustAct = false;
        this.pregameCount = 5 * 1000;
        this.originalRoles = [];
        this.emojis = emojis;
        this.kickAgrees = {};
        if (isPrivate)
            global.games.private.push(this);
        else
            global.games.open.push(this);
    }

    emit () {
        //Emit to the sockets of every player
        for (let player of this.players)
            player.emit(...arguments);
    }

    sendAlert (msg) {
        //Send a server alert to every player
        let message = new Message(this, msg, null, null, this.players, true);
        this.pastAlerts.push(message);
        message.send();
    }

    alertPlayer (msg, player, queue, prepend) {
        if (queue) {
            this.alertQueue[prepend ? 'unshift' : 'push']({
                msg: msg,
                recipients: [player]
            });
        }
        else {
            let message = new Message(this, msg, null, null, [player], true);
            this.pastAlerts.push(message);
            message.send();
        }
    }

    playerJoin (userObj, isNew) {
        if (!this.started && isNew && this.players.length < this.setup.total) { //If new to game
            //Create player object and references
            let newPlayer = new Player(userObj, this);
            this.players.push(newPlayer);
            global.players[newPlayer.user.id] = this;

            if (newPlayer.user.dev)
                newPlayer.emit('development');
            newPlayer.emit('self', newPlayer.id);
            newPlayer.emit('info', this.ranked, this.private);
            newPlayer.emit('emojis', this.emojis);
            newPlayer.emit('setup', {
                name: this.setup.name,
                id: this.setup.id,
                closed: this.setup.closed,
                roles: this.setup.roles,
                stateLengths: this.setup.stateLengths,
                count: this.setup.count ? {
                    village: this.setup.count.get('village'),
                    mafia: this.setup.count.get('mafia'),
                    monsters: this.setup.count.get('monsters'),
                    independent: this.setup.count.get('independent')
                } : {},
                whispers: this.setup.whispers,
                lastWill: this.setup.lastWill,
                total: this.setup.total
            });

            //Parse the player list to a simplified structure
            let parsedPlayerList = this.players.map(player => {
                return {
                    id: player.id,
                    dId: player.user.id,
                    name: player.user.name,
                    avatar: player.user.avatar,
                    tag: player.user.tag,
                    alive: player.alive,
                    profileImg: player.profileImg,
                    role: null,
                    nameColor: player.user.nameColor,
                    speechColor: player.user.speechColor,
                    emojis: player.user.emojis
                };
            });

            //Send the player list to the new player
            newPlayer.emit('playerList', parsedPlayerList);

            //Send the states
            newPlayer.emit('state', this.state, this.day, this.stateCount,this.kickPhase, this.kickPhaseCountDownStarted,this.kickAgrees);

            //Make a pregame meeting if one doesn't exist yet
            let pregame;
            if (!this.meetings.length)
                pregame = new meetingsGroup['Pregame'](this);
            else
                pregame = this.meetings[0];

            //Join the pregame meeting
            let member = pregame.join(newPlayer, {canSeeSpeech: true, canTalk: true});

            //Send meetings
            this.sendMeetings(newPlayer, true);

            //Send history
            this.sendHistory(newPlayer);

            //Get the parsed version of the new player object
            for (let playerObj of parsedPlayerList) {
                if (playerObj.id == newPlayer.id) {
                    newPlayer = playerObj;
                    break;
                }
            }

            //Tell existing players that the new player joined
            for (let player of this.players) {
                if (player.id != newPlayer.id)
                    player.emit('join', newPlayer);
            }

            //Start the game if full
            if (this.players.length == this.setup.total) {
                this.timers.pregame = new Timer(() => {this.start()}, this.pregameCount);
                this.emit('pregameCount', true, this.pregameCount);
            }
        }
        else if (!isNew) {
            let inGame = false;
            for (let player of this.players) { //Find the player in the player list
                if (player.user.id == userObj.id) {
                    player.setUser(userObj);

                    //Check if user is a dev
                    if (player.user.dev)
                        player.emit('development');

                    //Send if the game has started
                    if (this.started)
                        player.emit('start');

                    //Send them the player list, records, and state
                    player.emit('self', player.id);
                    player.emit('info', this.ranked, this.private);
                    player.emit('emojis', this.emojis);
                    player.emit('setup', {
                        name: this.setup.name,
                        id: this.setup.id,
                        closed: this.setup.closed,
                        roles: this.setup.roles,
                        stateLengths: this.setup.stateLengths,
                        count: this.setup.count ? {
                            village: this.setup.count.get('village'),
                            mafia: this.setup.count.get('mafia'),
                            monsters: this.setup.count.get('monsters'),
                            independent: this.setup.count.get('independent')
                        } : {},
                        whispers: this.setup.whispers,
                        lastWill: this.setup.lastWill,
                        total: this.setup.total
                    });
                    player.emit('playerList', this.players.map(p => {
                        return {
                            id: p.id,
                            dId: p.swappedWith ? p.swappedWith.user.id : p.user.id,
                            name: p.swappedWith ? p.swappedWith.user.name : p.user.name,
                            avatar: p.swappedWith ? p.swappedWith.user.avatar : p.user.avatar,
                            tag: p.swappedWith ? p.swappedWith.user.tag : p.user.tag,
                            alive: p.alive,
                            role: p.role ? p.role.revealed ? p.role.revealedAs : null : null,
                            nameColor: p.swappedWith ? p.swappedWith.user.nameColor : p.user.nameColor,
                            speechColor: p.swappedWith ? p.swappedWith.user.speechColor : p.user.speechColor,
                            emojis: p.swappedWith ? p.swappedWith.user.emojis : p.user.emojis
                        };
                    }));
                    player.emit('state', this.state, this.day, this.stateCount,this.kickPhase, this.kickPhaseCountDownStarted,this.kickAgrees);
                    player.emit('stateMods', this.stateMods);

                    //Send disguiser to relevant players
                    for (let p of this.players) {
                        if (p.role && p.role.name == 'Disguiser' && p.swappedWith == player)
                            player.emit('reveal', p.id, 'Disguiser');
                    }

                    //If role assigned, send their role
                    if (player.role)
                        player.emit('role', player.role.name);

                    //Send their meeting info
                    this.sendMeetings(player);

                    //Send the game history
                    this.sendHistory(player);

                    //Send the current time
                    this.syncClients(player);

                    //Send last will
                    player.emit('will', player.lastWill);
                    break;
                }
            }
        }
    }

    playerLeave (userId) {
        let player, user = this.getUser(userId);

        if (user)
            player = user.player;

        if (player) {
            if (this.started && player.alive) {
                //Make player suicide
                let action = new Action(['kill', 'sui'], player.id, player, false, 0, (self) => {
                    self.target.kill('sui', true);
                });
                this.instantAction(action);
            }
            else if (!this.started) {
                //Stop pregame count
                if (this.players.length == this.setup.total) {
                    this.timers.pregame.stop();
                    this.emit('pregameCount', false);
                }

                //Remove player when leaving before game starts
                this.meetings[0].leave(player);
                this.players.splice(this.players.indexOf(player), 1);
                this.emit('leave', player.id);
            }

            delete global.players[player.user.id];

            if (player.user.socket) {
                player.emit('redirect');
                player.user.socket.disconnect();
            }
        }
        // changed by lyu jin although there are no players, if game not started yet, will not remove game
        if (this.started && this.players.length < 1)
            this.closeGame();
    }

    closeGame () {
        let index = this.private ? global.games.private.indexOf(this) : global.games.open.indexOf(this);
        if (index != -1)
            this.private ? global.games.private.splice(index, 1) : global.games.open.splice(index, 1);
    }

    assignRoles () {
        //Assign all players their roles
        let roleset = {};

        if (this.setup.closed) { //Closed role setup
            //Choose the random roles for each alignment
            for (let alignment in this.setup.roles) {
                let roles = [];

                for (let i = 0; i < this.setup.count.get(alignment); i++) {
                    if (!roles.length)
                        roles = this.setup.roles[alignment].slice();

                    let roleName = utils.randArrVal(roles, this.setup.unique);
                    if (!roleset[roleName])
                        roleset[roleName] = 0;
                    roleset[roleName]++;
                }
            }
        }
        else { //Open role setup
            //Choose a random roleset from the roleset list
            roleset = utils.randArrVal(this.setup.roles);
        }

        //Randomize the player order
        let randomPlayers = utils.randomizeArray(this.players.slice());

        //Assign each player their role and emit it to their socket
        let i = 0;
        for (let roleName in roleset) {
            for (let j = 0; j < roleset[roleName]; j++) {
                let player = randomPlayers[i];
                player.setRole(rolesGroup[roleName]);
                this.recordDetail(`${player.name}'s role is ${player.role.name}`);
                i++;
            }
        }

        this.originalRoles = this.players.map(p => p.role.name);
    }

    addState (name, index, length) {
        if (!this.stateExists(name)) {
            this.setup.stateLengths.splice(index, 0, {name, length});
            this.emit('stateLengths', this.setup.stateLengths);
        }
    }

    getState (name) {
        let stateArr = this.setup.stateLengths.filter(s => s.name == name);
        return stateArr[0];
    }

    stateExists (name) {
        return this.setup.stateLengths.filter(s => s.name == name).length > 0;
    }

    makeMeetings () {
        //Create and join meetings
        for (let player of this.players)
            player.meet();

        //Send meeting info to players
        for (let player of this.players)
            this.sendMeetings(player, true);
    }

    sendMeetings (player, isNew) {
        let meetings = [];

        for (let meeting of this.meetings) {
            for (let member of meeting.members) {
                if (member.player.id == player.id) {
                    meetings.push(meeting.getMeetingInfo(member));
                    break;
                }
            }
        }

        player.emit('meetings', meetings);
    }

    sendHistory (player) {
        let history = player.history.map(state => {
            let res = {
                name: state.name,
                meetings: {},
                alerts: state.alerts.map(a => {
                    return {
                        id: a.id,
                        content: a.content,
                        server: a.server,
                        time: a.time,
                        state: a.stateCount
                    };
                }),
                deaths: state.deaths,
                revives: state.revives,
                stateMods: state.stateMods
            };

            for (let meetingId in state.meetings) {
                let meeting = state.meetings[meetingId];
                res.meetings[meetingId] = {
                    id: meeting.id,
                    name: meeting.name,
                    instant: meeting.instant,
                    members: meeting.members.map(m => {
                        return {
                            id: m.player.id,
                            canVote: m.canVote
                        }
                    }),
                    messages: meeting.messages.map(m => {
                        return {
                            id: m.id,
                            meeting: m.meeting ? m.meeting.id : null,
                            content: m.content,
                            sender: m.sender ? m.sender.id : null,
                            server: m.server,
                            whisper: m.whisper,
                            target: m.target ? m.target.id : null,
                            time: m.time
                        };
                    }),
                    votes: meeting.votes,
                    voting: meeting.voting,
                    canVote: meeting.canVote,
                    group: meeting.group,
                    targetType: meeting.targetType
                };
            }

            return res;
        });

        player.emit('history', history);
    }

    syncClients (player) {
        //Get time based on which timers are active
            //secondary -> main -> 0
        let time =
            this.timers.secondary ?
                this.timers.secondary.timeLeft() :
                this.timers.main ?
                    this.timers.main.timeLeft() :
                    0;

        //Check if emitting to everyone or individual
        if (player)
            player.emit('time', time);
        else
            this.emit('time', time);
    }

    nextState () {
        //Go to the next state of the game
        //Stop all timers
        for (let timerName in this.timers) {
            if (this.timers[timerName]) {
                this.timers[timerName].stop();
                this.timers[timerName] = null;
            }
        }

        //Finish meetings
        let nextState;
        // save player vote history
        let votedPlayers = this.meetings.map(meeting=>meeting.votes)
            .map(votes=>Object.keys(votes)).reduce((a,b)=>a.concat(b))

        //Determine which state is next
        switch (this.state) {
            case 'pregame':
                nextState = this.setup.startState || 'night';
                break;
            case 'day':
                if (this.stateExists('sunset'))
                    nextState = 'sunset';
                else
                    nextState = 'night';
                break;
            case 'sunset':
                nextState = 'night';
                break;
            case 'night':
                nextState = 'day';
                break;
        }



        //Check if anyone has won yet
        if(this.state == 'pregame') {
            this.finishMeetings();
            //Process actions from the previous state
            if (nextState != 'sunset') {
                this.events.emit('actionQueueNext', this.actionQueue[0]);
                this.processActionQueue();
            }
            this.events.emit('afterActions', nextState);
            this.moveForwardToNextState();
        }
        else if(this.kickPhase){
            //TODO process kick phase end
            this.kickPhase = false;
            this.kickPhaseCountDownStarted = false;
            this.kickAgrees = {};
            let unvotedPlayers = this.getUnvotedAlivePlayer(votedPlayers,this.state);
            if(!unvotedPlayers.length) {
                this.finishMeetings();
                if (nextState != 'sunset') {
                    this.events.emit('actionQueueNext', this.actionQueue[0]);
                    this.processActionQueue();
                }
                this.events.emit('afterActions', nextState);
                this.moveForwardToNextState();
            }
            else{
                  // kick unvotedPlayers & checkWinCondition & finishing game
                   unvotedPlayers.forEach(player=>{
                       player.kick();
                   });
                   this.checkWinConditions(true,()=>{
                       this.finishMeetings();
                       if (nextState != 'sunset') {
                           this.events.emit('actionQueueNext', this.actionQueue[0]);
                           this.processActionQueue();
                       }
                       this.events.emit('afterActions', nextState);
                       this.moveForwardToNextState();
                   });

            }

        }
        else{
            //TODO process kick phase start

            if(this.haveUnvotedAlivePlayer(votedPlayers,this.state)){
                    // TODO move forward to kick phase
                    this.kickPhase = true;
                    this.alivePlayerCount = this.players.filter(player=>player.alive).length;
                    this.players.forEach(player=>{
                        player.emit('start-kick-phase',this.alivePlayerCount,this.kickAgrees);
                    })
            } else{
                this.finishMeetings();
                //Process actions from the previous state
                if (nextState != 'sunset') {
                    this.events.emit('actionQueueNext', this.actionQueue[0]);
                    this.processActionQueue();
                }
                this.events.emit('afterActions', nextState);
                this.moveForwardToNextState();
            }

        }
    }
    hasNightRole(player){
        let playerStates = player.role.roleCards.map(roleCard=>Object.values(roleCard.meetings))
            .reduce((a,b)=>a.concat(b)).map(meeting=>meeting.state)
        return playerStates.indexOf('night') > -1;

    }
    haveUnvotedAlivePlayer(votedPlayers,state){
        if(state == 'day') {
            let alivedAndUnvotedPlayers = this.players.filter(player => player.alive && votedPlayers.indexOf(player.id) == -1);
            return alivedAndUnvotedPlayers.length;
        } else{
            let alivedAndUnvotedPlayers = this.players.filter(player => player.alive && this.hasNightRole(player) && votedPlayers.indexOf(player.id) == -1);
            return alivedAndUnvotedPlayers.length;
        }
    }
    getUnvotedAlivePlayer(votedPlayers,state){
        if(state == 'day') {
            let alivedAndUnvotedPlayers = this.players.filter(player => player.alive && votedPlayers.indexOf(player.id) == -1);
            return alivedAndUnvotedPlayers;
        } else{
            let alivedAndUnvotedPlayers = this.players.filter(player => player.alive && this.hasNightRole(player) && votedPlayers.indexOf(player.id) == -1);
            return alivedAndUnvotedPlayers;
        }
    }
    kickAgree(user){
        this.kickAgrees[user.player.id] = true;
        if(Object.keys(this.kickAgrees).length == Math.min(3,Math.floor(this.players.filter(player=>player.alive).length/2)))
        {
            // this game should be go to automatic kick countdown.
            this.kickPhaseCountDownStarted = true;
            this.timers.main = new Timer(() => {this.nextState()}, 15000);
            this.alivePlayerCount = this.players.filter(player=>player.alive).length;
            this.players.forEach(player=>{
                player.emit('kick_countdown_start',this.alivePlayerCount,this.kickAgrees)
            });
        } else{
            this.players.forEach(player=>{
                player.emit('kick_count_change',this.alivePlayerCount,this.kickAgrees)
            });
        }
    }
    moveForwardToNextState(){
        let nextState;
        switch (this.state) {
            case 'pregame':
                nextState = this.setup.startState || 'night';
                break;
            case 'day':
                if (this.stateExists('sunset'))
                    nextState = 'sunset';
                else
                    nextState = 'night';
                break;
            case 'sunset':
                nextState = 'night';
                break;
            case 'night':
                nextState = 'day';
                break;
        }
        this.checkWinConditions(false, () => {
            this.events.emit('beforeState', nextState);

            //If no one has won, go to the next state
            this.state = nextState;
            this.stateCount++;

            //Increment day count
            if (this.state == 'day')
                this.day++;

            //Clear the alert record and state mods
            this.pastAlerts = [];
            this.stateMods = {};

            //Add state to histories
            for (let player of this.players) {
                player.history.push({
                    name: `${this.state}-${this.day}`,
                    meetings: {},
                    alerts: [],
                    deaths: [],
                    revives: [],
                    stateMods: {}
                });
            }

            //Enable must act if no kills for 4 days/nights
            if ((this.state == 'day' || this.state == 'night') && !this.resetLastDeath)
                this.lastDeath++;
            else if (this.resetLastDeath) {
                this.lastDeath = 0;
                this.resetLastDeath = false;
            }

            if (this.lastDeath >= 6 && this.state != 'sunset')
                this.noKillMustAct = true;
            else
                this.noKillMustAct = false;

            //Emit the state update and time, make new meetings, and send queued alerts from previous state
            let state = this.getState(this.state);
            this.emit('state', this.state, this.day, this.stateCount,this.kickPhase, this.kickPhaseCountDownStarted,this.kickAgrees);
            this.emit('time', state.length);
            this.events.emit('state', this.state, this.day, this.stateCount,this.kickPhase, this.kickPhaseCountDownStarted,this.kickAgrees);
            this.makeMeetings();
            this.processAlertQueue();
            this.timers.main = new Timer(() => {this.nextState()}, state.length);

            //Emit state mods
            this.emit('stateMods', this.stateMods);
            this.events.emit('stateMods', this.stateMods);
            for (let state in this.stateMods) {
                let msg = stateModMessages(state);
                if (msg)
                    this.sendAlert(msg);
            }
            for (let player of this.players)
                player.history[this.stateCount].stateMods = this.stateMods;

            //Start an interval on which to sync the times of the players
            if (!this.syncInterval)
                this.syncInterval = setInterval(() => {this.syncClients()}, 30000);

            //Alert players if must act because of no kill
            if (this.noKillMustAct) {
                this.sendAlert(`No one has died for at least three days, so everyone must act to${this.state}`);
            }
        });
    }

    start () {
        //Start the game
        this.startTime = Date.now();

        //Move the game to inProgress
        this.closeGame();
        global.games.inProgress.push(this);

        //Init the game, assign roles, and go to the first state
        this.started = true;
        this.day = 0;
        this.emit('start');
        this.assignRoles();
        this.events.emit('start');
        this.nextState();
    }

    addToActionQueue (action, index) {
        index = index || 0;

        for (let i = 0; i <= index; i++) {
            if (!this.actionQueue[i])
                this.actionQueue[i] = [];
        }

        let dayQueue = this.actionQueue[index];
        for (let i = 0; i <= dayQueue.length; i++) {
            if (i == dayQueue.length || action.priority < dayQueue[i].priority) {
                dayQueue.splice(i, 0, action);
                break;
            }
        }
    }

    instantAction (action) {
        this.events.emit('instantAction', action);
        action.do();
        this.checkWinConditions(true, () => {
            this.checkMeetingsReady();
        });
    }

    processActionQueue () {
        for (let action of this.actionQueue[0])
            action.do();

        let futureStatesAmt = Object.keys(this.actionQueue).length;
        if (futureStatesAmt > 1) {
            for (let i = 1; i < futureStatesAmt; i++) {
                this.actionQueue[i - 1] = this.actionQueue[i];
                this.actionQueue[i] = [];
            }
        }
        else
            this.actionQueue[0] = [];
    }

    findInActionQueue (f) {
        let res = [];

        for (let step in this.actionQueue) {
            for (let i in this.actionQueue[step]) {
                let action = this.actionQueue[step][i];
                if (f(action))
                    res.push({action: action, step: step, index: i});
            }
        }
        return res;
    }

    findOneInActionQueue (f) {
        for (let step in this.actionQueue) {
            for (let i in this.actionQueue[step]) {
                let action = this.actionQueue[step][i];
                if (f(action))
                    return {action: action, step: step, index: i};
            }
        }
        return {};
    }

    removeFromActionQueue (step, index) {
        if (this.actionQueue[step])
            this.actionQueue[step].splice(index, 1);
    }

    processAlertQueue () {
        for (let alert of this.alertQueue) {
            if (!alert.recipients)
                this.sendAlert(alert.msg);
            else {
                for (let recipient of alert.recipients)
                    this.alertPlayer(alert.msg, recipient);
            }
        }

        this.alertQueue = [];
    }

    addToWinQueue (player) {
        let winCheck = player.role.winCheck;
        winCheck.player = player;

        for (let i = 0; i <= this.winQueue.length; i++) {
            if (i == this.winQueue.length || winCheck.priority < this.winQueue[i].priority) {
                this.winQueue.splice(i, 0, winCheck);
                break;
            }
        }
    }

    finishMeetings () {
        this.meetingsReady = 0;
        this.meetings = utils.randomizeArray(this.meetings);

        for (let meeting of this.meetings)
            meeting.finish(true);

        this.meetings = [];

        for (let player of this.players) {
            for (let meetingName in player.role.meetings) {
                if (player.role.meetings[meetingName].times <= 0)
                    delete player.role.meetings[meetingName];
            }

            for (let item of player.items) {
                for (let meetingName in item.meetings) {
                    if (item.meetings[meetingName].times <= 0)
                        delete item.meetings[meetingName];
                }
            }
        }
    }

    checkMeetingsReady () {
        if (this.state != 'day') {
            let readyCount = 0;
            let totalCount = this.nonInstantMeetings().length;

            for (let meeting of this.meetings) {
                if (Object.keys(meeting.votes).length == meeting.totalVoters && !meeting.instant)
                    readyCount++;
            }

            if (readyCount >= totalCount)
                this.nextState();
        }
        else {
            let villageMeeting;
            for (let meeting of this.meetings) {
                if (meeting.name == 'Village') {
                    villageMeeting = meeting;
                    break;
                }
            }
            if (Object.keys(villageMeeting.votes).length == villageMeeting.totalVoters - 1 && this.timers.main.timeLeft() > 60000)
                this.setSecondaryTimer();
            else if (Object.keys(villageMeeting.votes).length == villageMeeting.totalVoters) {
                this.nextState();
            }
        }
    }

    getPlayer (id) {
        for (let player of this.players) {
            if (player.id == id)
                return player;
        }
    }

    getUser (id) {
        for (let player of this.players) {
            if (player.user.id == id)
                return player.user;
        }
    }

    getMeeting (id) {
        for (let meeting of this.meetings) {
            if (meeting.id == id || meeting.name == id)
                return meeting;
        }
    }

    nonInstantMeetings () {
        return this.meetings.filter(meeting => !meeting.instant);
    }

    setSecondaryTimer () {
        if (this.timers.secondary)
            this.timers.secondary.stop();

        this.timers.secondary = new Timer(() => {this.timers.main.end()}, 60000);
        this.syncClients();
    }

    endRoundTimers () {
        if (this.timers.secondary)
            this.timers.secondary.end();
        else
            this.timers.main.end();
    }

    alivePlayers () {
        let alivePlayers = this.players.filter(player => {
            return player.alive;
        });
        return alivePlayers;
    }

    formatTime (time) {
        let minutes = String(Math.floor(time / 60000));
        let seconds = String(Math.floor((time % 60000) / 1000));

        if (minutes.length < 2)
            minutes = `0${minutes}`;

        if (seconds.length < 2)
            seconds = `0${seconds}`;

        return `${minutes}:${seconds}`;
    }

    getTimeFormatted () {
        return this.formatTime(Date.now() - this.createTime);
    }

    record (type, info) {
        let recordMsg;

        switch (type) {
            case 'vote':
                let targetName;
                if (info.meeting.targetType == 'player')
                    targetName = info.target == '*' ? 'no one' : this.getPlayer(info.target).name;
                else
                    targetName = info.target;

                recordMsg = `%r%${info.time} ${info.voter.name} (${info.meeting.name}) votes ${targetName}`;
                break;
            case 'unvote':
                recordMsg = `%r%${info.time} ${info.voter.name} (${info.meeting.name}) unvotes`;
                break;
            case 'message':
                if (info.server)
                    recordMsg = `%r%${info.time} ${info.content}`;
                else if (info.whisper)
                    recordMsg = `${info.time} ${info.sender.name} whispers to ${info.target.name}: ${info.content}`;
                else
                    recordMsg = `${info.time} ${info.sender.name} (${info.meeting.name}): ${info.content}`;
                break;
        }

        let key = `${this.state}-${this.day}`;

        if (!this.records[key])
            this.records[key] = [];

        this.records[key].push(recordMsg);
    }

    recordDetail (msg) {
        let time = this.getTimeFormatted();
        this.record('message', {content: msg, time: time, server: true});
    }

    capitalize (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    rateLimit (past) {
        let sum = 0;
        let now = Date.now();

        for (let i in past) {
            if ((now - past[i]) / 1000 > 20)
                past.splice(i, 1);
            else
                sum += 1 / ((now - past[i]) / 1000);
        }

        return true;
        //return sum < Number(process.env.SPAM_SUM_LIMIT) && past.length <= Number(process.env.SPAM_RATE_LIMIT);
    }

    processWinQueue (counts) {
        let winners = [];
        let aliveCount = this.alivePlayers().length;

        for (let winCheck of this.winQueue) {
            winCheck.check(winCheck, counts, aliveCount);
        }

        for (let winCheck of this.winQueue) {
            if (winCheck.won)
                winners.push({player: winCheck.player, group: winCheck.won});
        }

        this.winQueue = [];

        if (!winners.length && aliveCount == 0)
            winners.push({group: 'no one'});

        return winners;
    }

    checkWinConditions (instant, cb) {
        let counts = {};

        for (let player of this.players) {
            let align = player.role.winCount || player.role.alignment;

            if (!counts[align])
                counts[align] = 0;

            if (player.alive)
                counts[align]++;

            this.addToWinQueue(player);
        }

        let winners = this.processWinQueue(counts);

        if (winners.length)
            this.endGame(winners, instant);
        else {
            this.lastDeathMessage = null;
            if (cb)
                cb();
        }
    }

    async endGame (winners, instant) {
        clearInterval(this.syncInterval);
        for (let timerName in this.timers){
            if (this.timers[timerName])
                this.timers[timerName].stop();
        }

        if (instant && this.lastDeathMessage)
            this.alertQueue.push({msg: this.lastDeathMessage});

        this.finished = true;
        this.state = 'post';
        this.stateCount++;
        this.emit('state', this.state, this.day, this.stateCount,this.kickPhase, this.kickPhaseCountDownStarted,this.kickAgrees);
        this.emit('meetings', []);
        this.processAlertQueue();
        this.events.emit('endGame');

        var winMsg = {};
        for (let winner of winners) {
            if (!winMsg[winner.group]) {
                this.sendAlert(`${this.capitalize(winner.group)} win${winner.group == 'monsters' ? '' : 's'}!`);
                winMsg[winner.group] = true;
            }
        }

        this.emit('playerList', this.players.map(p => {
            return {
                id: p.id,
                dId: p.user.id,
                name: p.user.name,
                avatar: p.user.avatar,
                tag: p.user.tag,
                alive: p.alive,
                role: p.role.name,
                nameColor: p.user.nameColor,
                speechColor: p.user.speechColor,
                emojis: p.user.emojis
            };
        }));

        //close socket connections
        this.emit('villageWon', winMsg.village != null);
        this.emit('endGame');

        //remove players from games
        for (let player of this.players)
            delete global.players[player.user.id];

        //record game
        var gameRecord;
        if (!this.private) {
            gameRecord = new models.Game({
                id: this.id,
                setup: this.setup._id,
                players: this.players.map(p => p.user._id),
                names: this.players.map(p => p.name),
                roles: this.originalRoles,
                winners: winners.filter(w => w.player).map(w => w.player.user.id),
                history: JSON.stringify(this.records),
                timeStart: this.startTime,
                timeEnd: Date.now(),
                ranked: Boolean(this.ranked),
                stateLengths: {
                    day: this.getState('day').length,
                    night: this.getState('night').length
                }
            });
            await gameRecord.save();
        }

        //Save game reference in player's games
        if (gameRecord) {
            for (let player of this.players)
                models.User.updateOne({dId: player.user.id}, {$push: {games: gameRecord._id}}).exec();
        }

        //Increment times setup has been played
        models.Setup.updateOne({id: this.setup.id}, {$inc: {played: 1}}).exec();

        //Remove from in Progress list
        let index = global.games.inProgress.indexOf(this);
        if (index != -1)
            global.games.inProgress.splice(index, 1);
    }

}
