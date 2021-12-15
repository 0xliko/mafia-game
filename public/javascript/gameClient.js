class Game {

    constructor (id, socketUrl, isTest) {
        this.id = id;
        this.socket = io.connect(socketUrl);
        this.isTest = isTest;
        this.self = null;
        this.role = null;
        this.setup = null;
        this.started = false;
        this.finished = false;
        this.ranked = false;
        this.private = false;
        this.state = 'pregame';
        this.kickPhase = false;
        this.kickPhaseCountDownStarted = false;
        this.day = 0;
        this.development = false;
        this.stateCount = 0;
        this.stateView = 0;
        this.stateMods = {};
        this.players = [];
        this.meetings = [];
        this.alerts = [];
        this.items = [];
        this.timer = null;
        this.currentMeeting = null;
        this.manualScroll = false;
        this.clock = new Clock(this, $('.digital-clock'));
        this.history = [/*
            {
                name: 'state-day',
                meetings: {
                    'meetingId': {
                        members: [],
                        messages: [],
                        votes: {},
                        group: true,
                        targetType: ''
                    }
                },
                deaths: [],
                revives: []
            }
        */];
        this.quotableMessages = {};
        this.lastWill = '';
        this.mostRecentSpeakable = null;
        this.panel = 'center';
        this.isTest = isTest;
        this.pregameCountInterval = null;
        this.audio = {
            tick: new Audio('/audio/tick.wav'),
            bell: new Audio('/audio/bell.wav'),
            ping: new Audio('/audio/ping.wav'),
            day: new Audio('/audio/day.wav'),
            night: new Audio('/audio/night.wav'),
            sunset: new Audio('/audio/sunset.wav'),
            villageWin: new Audio('/audio/villagewin.mp3'),
            nonVillageWin: new Audio('/audio/nonvillagewin.mp3'),
            start: new Audio('/audio/start.wav'),
            join: new Audio('/audio/join.wav')
        };
        this.bgAudio = document.getElementById("bg-audio");
        this.bgAudio.volume = 0.05
        this.bgAudio.loop = true;
        $("body").click();
        setTimeout(()=>{
            this.bgAudio.play()
        },1000)


        this.settings = {};

        let deafaultSettings = {
            votingLog: true,
            clockTick: true,
            bellSound: true,
            ambientSound: false,
            winSound: true,
            volume: 1,
            largeText: false
        };
        this.serverEmojis = [];

        if (window.localStorage.cryptomafiaSettings) {
            this.settings = JSON.parse(window.localStorage.cryptomafiaSettings);
            for (let setting in deafaultSettings) {
                if (!this.settings.hasOwnProperty(setting))
                    this.settings[setting] = deafaultSettings[setting];
            }
            window.localStorage.cryptomafiaSettings = JSON.stringify(this.settings);
        }

        for (let setting in this.settings) {
            if (typeof this.settings[setting] == 'boolean') {
                let on = this.settings[setting];
                $(`.setting #${setting}`).parent().find('.check-icon').attr('class', `check-icon ${on ? 'fas' : 'far'} fa-check-square`);
                $(`.setting #${setting}`).attr('checked', on);

                if (setting == 'largeText' && on)
                    $('.msg').addClass('msg-large');
            }
            else if (typeof this.settings[setting] == 'string') {
                let value = this.settings[setting];
                $(`.setting #${setting}`).val(value);

                if (setting == 'volume')
                    this.setVolume(value);
            }
        }

        if (this.settings.clockTick)
                this.audio.tick.load();
        if (this.settings.bellSound)
                this.audio.bell.load();

        this.actionListeners();
        this.socketListeners();
    }
    thirtySecAlert(){
      console.log(this.state,"secAlert");
      if(this.state == 'day'){
          if(!this.userVoted()){
              $(".console-list").append(`<div class="msg-content msg-server">You didn't vote yet</div>`);
              this.autoScroll();
          }
      } else if(this.state == 'night'){
          let voted = this.userVoted();
          if(!voted && ["Cop","Doctor","Chemist","Disguiser", "Driver", "Godfather", "Hooker", "Lawyer", "Mafioso", "Spy", "Stalker"].indexOf(this.role) > -1){
              $(".console-list").append(`<div class="msg-content msg-server">You didn't vote yet</div>`);
              this.autoScroll();
          }
      }
    }
    actionListeners () {
        $(document).on('keypress', e => {
            let activeType = document.activeElement.type;

            if (activeType != 'input' && activeType != 'textarea')
            $('.speech-input').focus();
        });

        $('.speech-input').on('keypress', e => {
            let message = $('.speech-input').val();
            if (e.key == 'Enter' && message.length) {
                this.socket.emit(
                    'msg',
                    message,
                    this.currentMeeting,
                    $('.speech-drop').data('target'),
                    $('.speech-drop').data('type')
                );

                $('.speech-input').val('');
                this.manualScroll = false;
            }
        });

        $('.speech-input').on('keydown', e => {
            if (e.key == 'Tab') {
                e.preventDefault();
                let input = $('.speech-input').val();
                let atIndex = input.indexOf('@');

                if (atIndex != -1) {
                    let split = input.split('@');
                    let name = split[1].toLowerCase();
                    for (let player of this.players) {
                        if (player.name.toLowerCase().indexOf(name) != -1) {
                            split[1] = player.name;
                            $('.speech-input').val(split.join('@'));
                            break;
                        }
                    }
                }
            }
        });

        $('body').on('click', '.tab', e => {
            let meeting = $(e.target).data('meeting') || $(e.target).parent().data('meeting');
            this.switchMeeting(meeting, this.stateView);
        });

        $('body').on('click', '.vote-target', e => {
            let target = $(e.target).data('target');
            let meeting = $(e.target).data('meeting');

            if (!$(e.target).hasClass('vote-sel')) {
                $(e.target).parent().find('.vote-target').removeClass('vote-sel');
                $(e.target).addClass('vote-sel');
                this.socket.emit('vote', target, meeting);
            }
            else {
                $(e.target).removeClass('vote-sel');
                this.socket.emit('unvote', meeting);
            }
        });

        $('body').on('click', '.speech-drop .dropdown-item', e => {
            let item = $(e.target);
            $('.speech-drop').data('type', item.data('type'));
            item.data('target') ? $('.speech-drop').data('target', item.data('target')) : $('.speech-drop').removeData();
            $('.speech-label').text(capitalize(item.data('type')));
            $('.speech-input').attr('placeholder', item.data('target-name') ? `to ${item.data('target-name')}` : '');
        });

        $('body').on('dblclick', '.quotable', e => {
            this.socket.emit('quote', $(e.target).data('id') || $(e.target).parent().data('id'), this.mostRecentSpeakable);
        });

        $('.edit-will').click(() => {
            $('.will-content').val(this.lastWill);
        });

        $('.save-will').click(() => {
            let will = $('.will-content').val();
            this.lastWill = will;
            this.socket.emit('will', will);
        });

        $('.save-settings').click(() => {
            let game = this;
            let settings = this.settings;
            $('.setting').each(function () {
                if ($(this).hasClass('check-wrap')) {
                    let checkBox = $(this).find('[type="checkbox"]');
                    settings[checkBox.attr('id')] = checkBox.prop('checked');

                    if (checkBox.attr('id') == 'largeText') {
                        if (checkBox.prop('checked'))
                            $('.msg').addClass('msg-large');
                        else
                            $('.msg').removeClass('msg-large');
                    }
                }
                else if ($(this).hasClass('slider-wrap')) {
                    let slider = $(this).find('[type="range"]');
                    settings[slider.attr('id')] = slider.val();

                    if (slider.attr('id') == 'volume')
                        game.setVolume(slider.val());
                }
            });

            window.localStorage.cryptomafiaSettings = JSON.stringify(settings);

            if (!settings.ambientSound) {
                this.audio.day.pause();
                this.audio.night.pause();
                this.audio.sunset.pause();
            }
            else if (this.audio[this.state]) {
                // this.audio[this.state].play();
            }
        });

        $('.cancel-settings').click(() => {
            for (let setting in this.settings) {
                if (typeof this.settings[setting] == 'boolean') {
                    let on = this.settings[setting];
                    $(`.setting #${setting}`).parent().find('.check-icon').attr('class', `check-icon ${on ? 'fas' : 'far'} fa-check-square`);
                    $(`.setting #${setting}`).attr('checked', on);
                }
                else if (typeof this.settings[setting] == 'number') {
                    let value = this.settings[setting];
                    $(`.setting #${setting}`).val(value);
                }
            }
        });

        $('.hist-arrow').click(e => {
            this.changeState(this.stateView + Number($(e.target).data('dir')));
        });

        $('.clock').click(() => {
            if (this.stateView != this.stateCount)
                this.changeState(this.stateCount);
        });

        $('.main').on('swipeleft', () => {
            if (this.panel == 'left') {
                $('.panel').css('left', '-250px');
                this.panel = 'center';
            }
            else {
                $('.panel').css('left', '-500px');
                this.panel = 'right';
            }
        });

        $('.main').on('swiperight', () => {
            if (this.panel == 'right') {
                $('.panel').css('left', '-250px');
                this.panel = 'center';
            }
            else {
                $('.panel').css('left', '0px');
                this.panel = 'left';
            }
        });

        $('.leave').click(e => {

            if (!this.finished)
                this.socket.emit('leave');
            // window.location = '/';
            // return
            if (!this.finished || this.private)
                window.location = '/';
            else
                window.location = '/'
            window.location = `/game/${this.id}/review`;
        });

        $('body').on('click', '.rehost', e => {
            let dayLength = this.setup.stateLengths.filter(s => s.name == 'day')[0].length;
            let nightLength = this.setup.stateLengths.filter(s => s.name == 'night')[0].length;
            $.post('/game/create', {
                setup: this.setup.id,
                stateLengths: {
                    day: dayLength / 60000,
                    night: nightLength / 60000
                },
                ranked: this.ranked ? true : '',
                private: this.private ? true : ''
            }, res => {
                if (res.error)
                    window.location = '/';
                else
                    window.location = `/game/${res.game}`;
            });
        });

        $(".kick-phase-status").on('click','.kick',()=>{
            this.socket.emit('kick_agree');
        })
        //Autoscroll
        let messages = $('.speech-display')[0];
        $(messages).scroll(() => {
            if (Math.round(messages.scrollTop + messages.clientHeight) >= Math.round(messages.scrollHeight))
                this.manualScroll = false;
            else
                this.manualScroll = true;
        });
    }

    socketListeners () {
        let socket = this.socket;

        socket.on('connected', () => {
            socket.emit('join', this.id, this.isTest);
        });

        socket.on('development', () => {
            this.development = true;
        });

        socket.on('redirect', () => {
            window.location = '/';
        });

        socket.on('self', id => {
            this.devlog('--- Self ---');
            this.devlog(id);

            this.self = id;
            $('.loading-cover').hide();
        });

        socket.on('info', (ranked, isPrivate) => {
            this.devlog('--- Info ---');
            this.devlog(ranked);
            this.devlog(isPrivate);

            this.ranked = ranked;
            this.private = isPrivate;
        });

        socket.on('setup', setup => {
            this.devlog('--- Setup ---');
            this.devlog(setup);

            this.setup = setup;

            setupWidget($('.setup-wrapper'), setup, 'left', true, true);
            this.clock.setLengths(setup.stateLengths);
            this.clock.render();

            if (setup.lastWill && this.started)
                $('.edit-will').show();
        });

        socket.on('msg', (message) => {
            this.devlog('--- Message ---');
            console.log(message);

            let meeting, sender;
            if (message.meeting) {
                meeting = this.getMeeting(message.meeting);
                sender = this.getPlayer(message.sender);

                if (meeting && meeting.id == this.currentMeeting)
                    this.renderMessage(message);

                if (!message.server && !message.whisper) {
                    this.quotableMessages[message.id] = {
                        content: message.content,
                        sender: sender,
                        meeting: meeting,
                        time: message.time
                    };
                }

                /*const messageHtml = $(`
                <div class='msg ${this.settings.largeText ? 'msg-large' : ''}'>
                    <div class='msg-content msg-server'>${inHTMLData(message.content)}</div>
                </div>
                `);
                $('.console-list').append(messageHtml.html());
                this.autoScroll();*/
            }
            else
                this.showAlert(message.content);

            if (meeting)
                meeting.messages.push(message);
            else {
                message.state = this.stateCount;
                this.alerts.push(message);
            }

            if (
                message.content.toLowerCase().indexOf(`@${this.getPlayer(this.self).name.toLowerCase()}`) != -1 ||
                message.content.toLowerCase().indexOf('@everyone') != -1
            ) {
                //this.audio.ping.play();
            }
        });

        socket.on('playerList', players => {
            this.devlog('--- PlayerList ---');
            this.devlog(players);

            this.players = players;
            this.renderAllPlayers();
        });

        socket.on('join', player => {
            this.devlog('--- Player ---');
            this.devlog(player);
            this.audio.join.play();
            this.players.push(player);
            this.renderPlayer(player);

            this.meetings[0].members.push({id: player.id});
            //this.showAlert(`${player.name} joined, ${this.players.length}/${this.setup.total}`);
        });

        socket.on('leave', playerId => {
            this.devlog('--- Leave ---');
            this.devlog(playerId);

            let player;
            for (let i in this.players) {
                if (this.players[i].id == playerId) {
                    player = this.players[i];
                    this.players.splice(i, 1);
                    this.unrenderPlayer(playerId);
                    break;
                }
            }

            let members = this.meetings[0].members;
            for (let i in members) {
                if (members[i].id == playerId)
                    members.splice(i, 1);
            }

            //this.showAlert(`${player.name} left, ${this.players.length}/${this.setup.total}`);
        });

        socket.on('role', role => {
            this.devlog('--- Role ---');
            this.devlog(role);

            this.role = role;
            for (let player of this.players) {
                if (player.id == this.self) {
                    player.role = role;
                    $(`.player[data-id='${player.id}'] .player-info`).find('.role').remove();
                    $(`.player[data-id='${player.id}'] .player-info`).prepend(`
                        <span class='role role-${roleName(role)}' data-toggle='tooltip' title='${role}'></span>
                    `);
                    break;
                }
            }
        });

        socket.on('meetings', meetings => {
            this.devlog('--- Meetings ---');
            this.devlog(meetings);

            if (!this.meetings.length)
                this.meetings = meetings;
            else {
                for (let newMeet of meetings) {
                    for (let oldMeet of this.meetings) {
                        if (newMeet.id == oldMeet.id) {
                            oldMeet.targets = newMeet.targets;
                            oldMeet.canVote = newMeet.canVote;
                            oldMeet.canTalk = newMeet.canTalk;
                            break;
                        }
                    }
                }
            }

            if (this.stateView == this.stateCount)
                this.renderMeetingTabs();
            this.renderKickPhase();

        });

        socket.on('meeting', meeting => {
            this.devlog('--- Meeting ---');
            this.devlog(meeting);

            this.meetings.push(meeting);

            if (meeting.voting && this.stateView == this.stateCount)
                this.renderAction(meeting);

            if (meeting.group && this.stateView == this.stateCount) {
                this.renderMeetingTabs();
                this.switchMeeting(meeting.id);
            }
            this.renderKickPhase();

        });

        socket.on('vote', (vote) => {
            this.devlog('--- Vote ---');
            this.devlog(vote);

            let target = vote.target;
            let meeting = this.getMeeting(vote.meeting);
            let voter = this.getPlayer(vote.voter);
            let action = $(`.action[data-meeting='${vote.meeting}']`);
            let voteDisp = action.find(`.action-vote[data-voter='${vote.voter}']`);

            meeting.votes[vote.voter] = vote.target;

            if (meeting.targetType == 'player') {
                if (target != '*')
                    target = this.getPlayer(target).name;
                else
                    target = 'no one';
            }

            voteDisp.html(`${voter.id == this.self ? 'You vote' : inHTMLData(voter.name) + ' votes'} <span class='vote-choice'>${inHTMLData(target)}</span>`);

            if (meeting.instant)
                $(`.action[data-meeting='${vote.meeting}']`).find('.dropdown-toggle').addClass('disabled');

            if (!meeting.instant && this.settings.votingLog)
                this.showAlert(`${voter.name} votes ${target}`, true, vote.time);
            this.renderKickPhase();
        });

        socket.on('unvote', (playerId, meetingId, time) => {
            this.devlog('--- Unvote ---');
            this.devlog(playerId);
            this.devlog(meetingId);

            let meeting = this.getMeeting(meetingId);
            let voter = this.getPlayer(playerId);
            let voteDisp = $(`.action[data-meeting='${meetingId}'] .action-vote[data-voter='${playerId}']`);

            delete meeting.votes[playerId];

            voteDisp.text(playerId == this.self ? 'You' : voter.name);

            if (this.settings.votingLog)
                this.showAlert(`${voter.name} unvotes`, true, time);
        });

        socket.on('start', () => {
            this.devlog('--- Starting Game ---');

            clearInterval(this.pregameCountInterval);
            this.audio.start.pause();
            this.started = true;
            $(".console-list").append(`<div class="msg-content msg-server">Game started</div>`);
            this.autoScroll();
            $('.player-info .role').show();

            if (this.setup && this.setup.lastWill)
                $('.edit-will').show();
        });

        socket.on('state', (state, day, count,kickPhase,kickPhaseCountDownStarted,kickAgrees) => {

            console.log('--- State ---',kickPhase,kickPhaseCountDownStarted,kickAgrees);
            this.devlog(state);
            this.devlog(day);
            for (let meeting of this.meetings) {
                this.history[this.stateCount].meetings[meeting.id] = {
                    id: meeting.id,
                    name: meeting.name,
                    instant: meeting.instant,
                    members: meeting.members,
                    messages: meeting.messages,
                    votes: meeting.votes,
                    voting: meeting.voting,
                    canVote: meeting.canVote,
                    group: meeting.group,
                    targetType: meeting.targetType
                };
            }

            if (this.history[this.stateCount])
                this.history[this.stateCount].alerts = this.alerts;

            this.state = state;
            this.day = day;
            this.kickPhase = kickPhase;
            this.kickPhaseCountDownStarted = kickPhaseCountDownStarted;
            this.stateCount = count;
            this.kickAgrees = kickAgrees;
            this.stateView = count;
            this.meetings = [];
            this.alerts = [];
            if (state != 'pregame' && state != 'post')
              $(".console-list").append(`<div class="msg-content msg-server">${capitalize(state)} ${day} started</div>`);
            this.renderState();
            this.renderKickPhase();
            // this.renderAction();
            $('body').attr('class', state.split(' ').join('-'));
            $('.logo').attr('class', `logo ${state.split(' ').join('-')}`);

            this.history[this.stateCount] = {
                name: `${state}-${day}`,
                meetings: {},
                alerts: [],
                deaths: [],
                revives: []
            };

            if (state != 'pregame' && !this.clock.started)
                this.clock.start();

            switch (this.state) {
                case 'day':
                case 'night':
                    if (this.settings.bellSound) {
                        //this.audio.bell.play();
                    }
                case 'sunset':
                    if (this.settings.ambientSound) {
                        this.audio.day.pause();
                        this.audio.night.pause();
                        this.audio.sunset.pause();

                        this.audio[this.state].currentTime = 0;
                        this.audio[this.state].loop = true;
                        // this.audio[this.state].play();
                    }
                    break;
            }
        });

        socket.on('stateLengths', stateLengths => {
            this.devlog('--- State Lengths ---')
            this.devlog(stateLengths);

             this.clock.setLengths(stateLengths);
             this.clock.render();
            this.setup.stateLengths = stateLengths;
        });

        socket.on('stateMods', stateMods => {
            this.devlog('--- State Mods ---');
            this.devlog(stateMods);

            this.stateMods = stateMods;

            for (let state in stateMods) {
                if (stateMods[state]) {
                    $('body').attr('class', state.split(' ').join('-'));
                    $('.logo').attr('class', `logo ${state.split(' ').join('-')}`);
                }
            }

            this.history[this.stateCount].stateMods = stateMods;
        });

        socket.on('time', time => {
            console.log('_______time________', time)
            this.devlog('--- Time ---',time);
            this.devlog(time);

             this.clock.setTime(time);

            if (this.state != 'pregame') {
                if (!this.clock.started)
                    this.clock.start();

                this.clock.step();
            }
        });

        socket.on('dead', (playerId, instant) => {

            this.devlog('--- Dead ---');
            this.devlog(playerId);

            let player = this.getPlayer(playerId);
            let state = this.history[this.stateCount];
            if (player) {
                $(".dead-message").text(`Player ${player.name} was Killed!`)
                $("#deadAlertModal").modal();
                setTimeout(()=>{
                    $("#deadAlertModal").modal('hide');
                },4000)
                player.alive = false;

            }

            if (instant) {
                for (let meeting of this.meetings) {
                    if (playerId == this.self)
                        meeting.canVote = false;

                    for (let i in meeting.targets) {
                        if (meeting.targets[i] == playerId)
                            meeting.targets.splice(i, 1);
                    }

                    for (let voterId in meeting.votes) {
                        if (voterId == playerId && !meeting.instant)
                            delete meeting.votes[voterId];

                        if (meeting.votes[voterId] == playerId && !meeting.instant)
                            delete meeting.votes[voterId];
                    }
                }
            }

            this.renderAllActions();
            if (this.stateView == this.stateCount)
                this.renderAllPlayers();

            state.deaths.push(playerId);
            if (state.revives.indexOf(playerId) != -1)
                state.revives.splice(state.revives.indexOf(playerId), 1);

            if (playerId == this.self)
                this.setSpeech(false);
        });

        socket.on('kick', (playerId, instant) => {

            this.devlog('--- Dead ---');
            this.devlog(playerId);

            let player = this.getPlayer(playerId);
            let state = this.history[this.stateCount];
            if (player) {
                $(".dead-message").text(`Player ${player.name} was kicked!`)
                $("#deadAlertModal").modal();
                setTimeout(()=>{
                    $("#deadAlertModal").modal('hide');
                },4000)
                player.alive = false;

            }

            if (instant) {
                for (let meeting of this.meetings) {
                    if (playerId == this.self)
                        meeting.canVote = false;

                    for (let i in meeting.targets) {
                        if (meeting.targets[i] == playerId)
                            meeting.targets.splice(i, 1);
                    }

                    for (let voterId in meeting.votes) {
                        if (voterId == playerId && !meeting.instant)
                            delete meeting.votes[voterId];

                        if (meeting.votes[voterId] == playerId && !meeting.instant)
                            delete meeting.votes[voterId];
                    }
                }
            }

            this.renderAllActions();
            if (this.stateView == this.stateCount)
                this.renderAllPlayers();

            state.deaths.push(playerId);
            if (state.revives.indexOf(playerId) != -1)
                state.revives.splice(state.revives.indexOf(playerId), 1);

            if (playerId == this.self)
                this.setSpeech(false);
        });

        socket.on('revive', playerId => {
            this.devlog('--- Revive ---');
            this.devlog(playerId);

            let player = this.getPlayer(playerId);
            let state = this.history[this.stateCount];
            if (player)
                player.alive = true;

            if (this.stateView == this.stateCount)
                this.renderAllPlayers();

            state.revives.push(playerId);
            if (state.deaths.indexOf(playerId) != -1)
                state.deaths.splice(state.deaths.indexOf(playerId), 1);
        });

        socket.on('reveal', (playerId, role) => {
            this.devlog('--- Reveal ---');
            this.devlog(playerId);
            this.devlog(role);

            let player = this.getPlayer(playerId);
            if (player)
                player.role = role;

            $(`.player[data-id='${playerId}'] .player-info`).find('.role').parent().remove();

            let newRoleHtml = $(`
                <div tabindex='0' class='poptag' data-toggle='popover' data-trigger='focus' data-type='role' data-id='${role}' title='${role}' data-content='pop-${role}'>
                    <div class='role role-${roleName(role)}' data-toggle='tooltip' title='${role}'></div>
                </div>
            `);
            $(`.player[data-id='${playerId}'] .player-info`).prepend(newRoleHtml);
            // newRoleHtml.popover();
            console.log('roleName______')
            newRoleHtml.popover({container: $(".site-wrapper,.game-container") , placement: function(popover,dom,context){
                    const domPosition = $(dom)[0].getBoundingClientRect();
                    const containerPosition = $(".site-wrapper,.game-container")[0].getBoundingClientRect();
                    const offSetX =  domPosition.x + domPosition.width/2 - containerPosition.x - 34;
                    const offSetY =  domPosition.y + domPosition.height - containerPosition.y + 5;

                    $(popover).css({marginTop:offSetY,marginLeft:offSetX})
                    return 'top';
                }});
            // newRoleHtml.find('.role').tooltip();
        });

        socket.on('history', history => {
            this.devlog('--- History ---');
            this.devlog(history);

            this.history = history;

            for (let state of history) {
                this.alerts = state.alerts;

                for (let meetingId in state.meetings) {
                    let histMeeting = state.meetings[meetingId];

                    for (let meeting of this.meetings) {
                        if (meeting.id == histMeeting.id) {
                            meeting.messages = histMeeting.messages;
                            meeting.votes = histMeeting.votes;
                        }
                    }

                    for (let message of histMeeting.messages) {
                        if (!message.whisper && !message.server) {
                            this.quotableMessages[message.id] = {
                                content: message.content,
                                sender: this.getPlayer(message.sender),
                                meeting: this.getMeeting(meetingId),
                                time: message.time
                            };
                        }
                    }
                }
            }

            this.renderAllActions();
            this.renderMeetingTabs();
            this.renderKickPhase()
        });

        socket.on('will', will => {
            this.devlog('--- Last Will ---');
            this.devlog(will);

            this.lastWill = will;
        });

        socket.on('quote', (quote) => {
            this.devlog('--- Quote ---');
            this.devlog(quote);

            let meeting = this.getMeeting(quote.meeting);
            quote = {
                originalMsg: this.quotableMessages[quote.id],
                sender: quote.sender,
                meeting: quote.meeting,
                time: quote.time,
                quote: true
            };

            if (quote.originalMsg && meeting) {
                meeting.messages.push(quote);
                if (meeting.id == this.currentMeeting)
                    this.renderMessage(quote);

                /*const messageHtml = $(`
                <div class='msg ${this.settings.largeText ? 'msg-large' : ''}'>
                    <div class='msg-content msg-server'>${inHTMLData(quote.content)}</div>
                </div>
                `);
                $('.console-list').append(messageHtml.html());
                this.autoScroll();*/
            }
        });

        socket.on('spam', () => {
            this.devlog('--- Spam ---')

            this.showAlert('You are speaking too quickly');
        });

        socket.on('pregameCount', (start, time) => {
            this.devlog('--- Pregame Count ---');
            this.devlog(start);
            this.devlog(time);

            if (start) {
                let count = 0;

                this.showAlert(`Game starting in ${time / 1000} seconds`);
                this.pregameCountInterval = setInterval(() => {
                    count++;
                    //this.showAlert(time / 1000 - count);
                    this.audio.start.play();
                    if (this.settings.clockTick) {
                     //   this.audio.tick.play();
                    }
                }, 1000);
                this.audio.start.play();
                if (this.settings.clockTick) {
                   //this.audio.tick.play();
                }
            }
            else {
                clearInterval(this.pregameCountInterval);
                this.audio.start.pause();
                //this.showAlert('Game start canceled');
            }
        });

        socket.on('emojis', serverEmojis => {
            this.devlog('--- Emojis ---');
            this.devlog(serverEmojis);

            for (let emoji of serverEmojis) {
                emojiImages[emoji.name] = emoji.url;
                this.serverEmojis.push(emoji.name);
            }
        });

        socket.on('villageWon', villageWon => {
            this.devlog('--- Village Won ---');
            this.devlog(villageWon);

            if (this.settings.winSound) {
                /*if (villageWon)
                    this.audio.villageWin.play();
                else
                    this.audio.nonVillageWin.play();*/
            }
        });

        socket.on('endGame', instant => {
            this.devlog('--- EndGame ---');

            if (this.settings.bellSound) {
                // this.audio.bell.play();
            }

            this.finished = true;
            this.clock.stop();
            socket.disconnect();
            // window.location='/'
            // $('.game-info').append(`<button class='rehost btn btn-primary raydium-theme-button active'>Rehost</button>`);
        });

        socket.on('start-kick-phase',(alivePlayerCount,kickAgrees)=>{
          this.kickPhase = true;
          this.kickAgrees = kickAgrees;
          this.renderKickPhase();
        });
        socket.on('kick_count_change',(alivePlayerCount,kickAgrees)=>{
            this.kickAgrees = kickAgrees;
            this.renderKickPhase();
        });
        socket.on('kick_countdown_start',(alivePlayerCount,kickAgrees)=>{
            this.kickPhaseCountDownStarted = true;
            this.kickAgrees = kickAgrees;
            this.renderActionDisable();
            this.renderKickPhase();
            this.clock.setTime(15000);
            this.clock.start();
        });

    }
    userVoted(){
        let voters = Object.values((this.history[this.stateView] || {meetings: {}}).meetings).map(meeting=>Object.keys(meeting.votes))
        if(voters.length)
            voters = voters.reduce((a,b)=>a.concat(b))
        return voters.indexOf(this.self) > -1;
    }
    renderActionDisable(){
        if(this.userVoted())
           $(".action-drop .dropdown-toggle").addClass('disabled');
    }
    kickAgreed(){
        return Object.keys(this.kickAgrees).indexOf(this.self) > -1;
    }
    renderKickPhase(){

        let alivePlayerCount = this.players.filter(player=>player.alive).length;
        this.maximunKickCount = Math.min(3,Math.floor(alivePlayerCount/2));
        let voted = this.userVoted();
        if(this.kickPhase && !this.kickPhaseCountDownStarted){
            if(!this.kickAgreed() && (voted || (this.state == 'night' && !this.meetings.length)))
            {
                $(".kick-phase-status").html(`<button class='kick btn btn-simple raydium-theme-button active'>
                    Kick ${new Array(this.maximunKickCount-Object.keys(this.kickAgrees).length).fill('×').join(' ')}
                </button>`)
            }
            else{
                $(".kick-phase-status").html(`<div class='kick-alert'>
                    Kick ${new Array(this.maximunKickCount-Object.keys(this.kickAgrees).length).fill('×').join(' ')}
                </div>`)
            }
        }
        else{
                $(".kick-phase-status").html(``);
        }

        if(this.kickPhaseCountDownStarted){

        }
    }
    getPlayer (id) {
        if (id == '*')
            return {name: 'no one'};

        for (let player of this.players) {
            if (player.id == id)
                return player;
        }
    }

    getMeeting (id, state) {
        if (state == null || state == this.stateCount) {
            for (let meeting of this.meetings) {
                if (meeting.id == id)
                    return meeting;
            }
        }
        else {
            for (let meetingId in this.history[state].meetings) {
                if (meetingId == id)
                    return this.history[state].meetings[meetingId];
            }
        }
    }

    getGroupMeetings (state) {
        if (state == null || state == this.stateCount)
            return this.meetings.filter(m => m.group);
        else
            return Object.values(this.history[state].meetings).filter(m => m.group);
    }

    getAlerts (state) {
        if (state == null || state == this.stateCount)
            return this.alerts;
        else
            return Object.values(this.history[state].alerts);
    }

    showAlert (msg, save, time) {
        this.renderMessage({server: true, content: msg});

        const messageHtml = $(`
                <div class='msg ${this.settings.largeText ? 'msg-large' : ''}'>
                    <div class='msg-content msg-server'>${inHTMLData(msg)}</div>
                </div>
                `);
        $('.console-list').append(messageHtml.html());
        this.autoScroll();

        if (save) {
            this.alerts.push({
                content: msg,
                server: true,
                state: this.stateCount,
                time: time || '00:00'
            });
        }
    }

    setSpeech (on) {
        let speechInput = $('.speech-input-wrapper');
        if (on) {
            speechInput.show()
            this.mostRecentSpeakable = this.currentMeeting;
        }
        else
            speechInput.hide();

    }

    switchMeeting (meetingId, state) {
        let meeting = meetingId ? this.getMeeting(meetingId, state) : null;

        if (meeting && meeting.group) {
            this.currentMeeting = meeting.id;
            this.setSpeech(
                meeting.speech &&
                meeting.canTalk &&
                (meeting.members.length > 1 || meeting.name == 'Pregame') &&
                (state == null || state == this.stateCount)
            );
            $('.tab').removeClass('tab-sel');
            $(`.tab[data-meeting='${meeting.id}']`).addClass('tab-sel');
        }
        else {
            this.currentMeeting = null;
            this.setSpeech(false);
        }

        this.renderAllPlayers(state);
        this.renderAllActions(state);
        this.renderAllMessages(state);
        if (state == null || state == this.stateCount)
            this.renderSpeechAbilities();
    }

    renderMeetingTabs (state) {
        let groupMeetings = this.getGroupMeetings(state);

        if (groupMeetings.length) {
            $('.tabs').html('');

            for (let meeting of groupMeetings) {
                 $('.tabs').append(`<div class='tab' data-meeting='${meeting.id}'>
                    <div class='tab-label'>${meeting.name}</div>
                </div>`);
            }

            this.switchMeeting(groupMeetings[0].id, state);
        }
        else {
            let tabName;
            let stateName = this.history[state != null ? state : this.stateCount].name.split('-')[0];

            switch (stateName) {
                case 'post':
                    tabName = 'Game Over';
                    break;
                default:
                    tabName = capitalize(stateName);
            }

            $('.tabs').html(`<div class='tab tab-sel'>
                <div class='tab-label'>${tabName}</div>
            </div>`);
            this.switchMeeting(null, state);
        }
    }

    renderState (state) {
        let stateName, day;

        if (state == null) {
            stateName = this.state;
            day = this.day;
        }
        else {
            let key = this.history[state].name;
            stateName = key.split('-')[0];
            day = key.split('-')[1];
        }

        if (stateName != 'pregame' && stateName != 'post') {
            $('.state-desc .state').text(capitalize(stateName));
            $('.state-desc .state').addClass('special');
            $('.state-desc .day').text(day);
            this.autoScroll();
        }
        else if (stateName == 'post') {
            $('.state-desc .state').text('Game Over');
            $('.state-desc .state').removeClass('special');
            $('.state-desc .day').text('');
        }
        else {
            $('.state-desc .state').text('Lobby');
            $('.state-desc .state').removeClass('special');
            $('.state-desc .day').text('');
        }

        $('.hist-arrow').hide();

        if (this.stateView > 0)
            $('.hist-left').show();

        if (this.stateView < this.stateCount)
            $('.hist-right').show();
    }

    renderSpeechAbilities () {
        let meeting = this.getMeeting(this.currentMeeting);
        if (meeting) {
            let dropdown = $('.speech-drop .dropdown-menu');
            dropdown.html(`<div class='dropdown-item' data-type='chat' data-display='Chat'>Chat</div>`);

            if (meeting.name == 'Village' && this.setup.whispers) {
                dropdown.append('<div class="dropdown-divider"></div>');
                for (let player of this.players) {
                    if (player.id != this.self && player.alive)
                        dropdown.append(`<div class='dropdown-item' data-type='whisper' data-target='${player.id}' data-target-name='${player.name}'>Whisper to ${player.name}</div>`);
                }
            }

            for (let ability of meeting.speechAbilities) {
                let targetName;
                dropdown.append('<div class="dropdown-divider"></div>');

                if (ability.targetType == 'none')
                    dropdown.append(`<div class='dropdown-item' data-type='${ability.name}'>${capitalize(ability.name)}</div>`);
                else {
                    for (let target of ability.targets) {
                        if (ability.targetType == 'player')
                            targetName = this.getPlayer(target).name;
                        else
                            targetName = target;

                        dropdown.append(`<div class='dropdown-item' data-type='${ability.name}' data-target='${target}' data-target-name='${targetName}'>${capitalize(ability.name)} to ${targetName}</div>`);
                    }
                }
            }
        }
    }

    renderAllActions (state) {
        $('.action-list').html('');
        let meetings, past = false;

        if (state == null || state == this.stateCount)
            meetings = this.meetings;
        else {
            meetings = Object.values(this.history[state].meetings);
            past = true;
        }

        for (let meeting of meetings) {
            if (meeting.voting && meeting.canVote) {
                if (!past)
                    this.renderAction(meeting);
                else {
                    this.renderAction(meeting);
                }
            }
        }

    }

    renderAllPlayers (state) {
        //Clear the player html
        $('.player-list').html('');
        let players = {};

        //Get current meeting
        let meeting = this.getMeeting(this.currentMeeting, state);

        //Record players in current meeting
        if (meeting && meeting.group && meeting.name != 'Pregame') {
            players[meeting.name] = [];

            for (let member of meeting.members) {
                let player = this.getPlayer(member.id);

                if (player && player.alive) {
                    if (player.id == this.self)
                        players[meeting.name].unshift(player);
                    else
                        players[meeting.name].push(player);
                }
            }
        }

        players.alive = [];
        players.dead = [];

        //Record alive and dead players
        if (state == null || state == this.stateCount) { //Current state
            for (let player of this.players) {
                if (!meeting || !meeting.group || meeting.name == 'Pregame' || players[meeting.name].indexOf(player) == -1) {
                    if (player.alive) {
                        if (player.id == this.self)
                            players.alive.unshift(player);
                        else
                            players.alive.push(player);
                    }
                    else
                        players.dead.push(player);
                }
            }
        }
        else { //Past state
            for (let player of this.players) {
                if (!meeting || !meeting.group || meeting.name == 'Pregame' || players[meeting.name].indexOf(player) == -1) {
                    let deathState, reviveState;
                    for (let i = 0; i < state; i++) {
                        if (this.history[i].deaths.indexOf(player.id) != -1)
                            deathState = i;
                        else if (this.history[i].revives.indexOf(player.id) != -1)
                            reviveState = i;
                    }

                    if (deathState == null)
                        players.alive.push(player);
                    else if (reviveState == null)
                        players.dead.push(player);
                    else if (deathState < reviveState)
                        players.alive.push(player);
                    else
                        players.dead.push(player);
                }
            }
        }

        //Create html for recorded players
        for (let key in players) {
            if (players[key].length) {
                if (this.started)
                    $('.player-list').append(`<div class='divider'>${capitalize(key)}</div>`);

                for (let player of players[key])
                    this.renderPlayer(player);
            }
        }

        if (!this.started)
            $('.player-info .role').hide();


    }

    renderAllMessages (state) {
        let meeting = this.getMeeting(this.currentMeeting, state);
        let messageList = this.getAlerts(state);
        $('.speech-display').html('');

        if (meeting)
            messageList = messageList.concat(meeting.messages);

        messageList = messageList.sort((a, b) => {
            let aTime = a.time.split(':').map(n => Number(n));
            let bTime = a.time.split(':').map(n => Number(n));

            if (aTime[0] != bTime[0])
                return aTime[0] - bTime[0];
            else
                return aTime[1] - bTime[1];
        });

        for (let message of messageList)
            this.renderMessage(message);
    }

    renderAction (meeting) {

        let disabled = !meeting.targets || !meeting.targets.length || (meeting.instant && Object.keys(meeting.votes).length);

        disabled = disabled || (this.kickPhaseCountDownStarted && this.userVoted())

        let action = $(`
            <div class='action' data-meeting='${meeting.id}'>
                <div class='action-drop dropdown'>
                    <div class='dropdown-toggle ${disabled ? 'disabled' : ''}' data-toggle='dropdown'>
                        ${meeting.name}
                    </div>
                    <div class='dropdown-menu targets'></div>
                </div>
                <div class='action-vote' data-voter='${this.self}'>You</div>
            </div>
        `);

        let targets = action.find('.targets');

        if (meeting.targets) {

            for (let target of meeting.targets) {

                let name = target;

                if (meeting.targetType == 'player' && target != '*')
                    name = this.getPlayer(target).name;
                else if (target == '*')
                    name = 'no one';

                let targetHtml = $(`<div class='dropdown-item vote-target ${meeting.votes[this.self] == target ? 'vote-sel' : ''}' data-target='${target}' data-meeting='${meeting.id}'>${inHTMLData(name)}</div>`);
                targets.append(targetHtml);
            }

        }

        if (meeting.members) {
            // console.log(JSON.stringify(meeting.members), this.role,"members")
            for (let member of meeting.members) {
                let player = this.getPlayer(member.id);
                if (player.id != this.self && player.alive)
                    action.append(`<div class='action-vote' data-voter='${player.id}'>${inHTMLData(player.name)}</div>`);
            }
        }

        if (meeting.votes) {
            for (let voterId in meeting.votes) {
                let voter = this.getPlayer(voterId);
                let target = meeting.targetType == 'player' ? this.getPlayer(meeting.votes[voterId]).name : meeting.votes[voterId];
                action.find(`[data-voter='${voterId}']`).html(`${voterId == this.self ? 'You vote' : inHTMLData(voter.name) + ' votes'} <span class='vote-choice'>${inHTMLData(target)}</span>`);
            }
        }

        $('.action-list').append(action);

    }

    renderPlayer (player) {
        let avatar = player.profileImg; // avatarUrl(player.dId, player.avatar, player.tag);

        let playerHtml = $(`
            <div class='player' data-id='${player.id}'>
                <div class='player-info'>
                    <div tabindex='0' class='poptag' data-toggle='popover' data-trigger='focus' data-type='role' data-id='${player.role}' title='${player.role || 'Unknown'}' data-content='pop-${player.role}'>
                        <div class='role role-${roleName(player.role)}' data-toggle='tooltip' title='${player.role || 'Unknown'}'></div>
                    </div>
                    <a class='player-pop' href='/user/${player.dId}' target='_blank'>
                        <div class='avatar' style='background-image: url("${avatar}");'></div>
                        <div class='name' style='color: ${player.nameColor || '#dcdcdc'}'>${inHTMLData(player.name)}</div>
                    </a>
                </div>
            </div>
        `);

        if (!this.started)
            playerHtml.find('.role').hide();

        if (player.role) {

            playerHtml.find('.poptag').popover({container: $(".site-wrapper,.game-container") , placement: function(popover,dom,context){
                    const domPosition = $(dom)[0].getBoundingClientRect();
                    const containerPosition = $(".site-wrapper,.game-container")[0].getBoundingClientRect();
                    const offSetX =  domPosition.x + domPosition.width/2 - containerPosition.x - 34;
                    const offSetY =  domPosition.y + domPosition.height - containerPosition.y + 5;

                    $(popover).css({marginTop:offSetY,marginLeft:offSetX})
                    return 'top';
                }});
            // playerHtml.find('.role').tooltip();
        }

        $('.player-list').append(playerHtml);
    }

    unrenderPlayer (playerId) {
        $(`.player[data-id='${playerId}']`).remove();
    }

    renderMessage (msg) {
        let sender = this.getPlayer(msg.sender);
        let greentext = String(msg.content).indexOf('>') == 0;
        let metext = String(msg.content).indexOf('/me') == 0;
        let messageHtml;

        if (metext)
            msg.content = msg.content.replace('/me', '');

        if (!msg.server && !msg.whisper && !msg.quote && sender) { //regular message
            let avatar = sender.profileImg; // avatarUrl(sender.dId, sender.avatar, sender.tag);
            let color = greentext ? '#9bd062' : metext ? '#9b9b9b' : sender.speechColor || '#dcdcdc';
            messageHtml = $(`
                <div class='msg ${this.settings.largeText ? 'msg-large' : ''}' data-id='${msg.id}'>
                    <div class='msg-sender'>
                        <div class='msg-time'>${msg.time}</div>
                        <div class='avatar' style='background-image: url("${avatar}");'></div>
                        <div class='msg-sender-name' style='color: ${sender.nameColor || '#dcdcdc'}'>${inHTMLData(sender.name)}</div>
                    </div>
                    <div class='msg-content quotable ${metext ? 'metext' : ''}' data-id='${msg.id}' style='color: ${color}'>${inHTMLData(msg.content)}</div>
                </div>
            `);
        }
        else if (msg.whisper && sender) { //whisper
            let avatar = sender.profileImg; // avatarUrl(sender.dId, sender.avatar, sender.tag);
            messageHtml = $(`
                <div class='msg ${this.settings.largeText ? 'msg-large' : ''}'>
                    <div class='msg-sender'>
                        <div class='msg-time'>${msg.time}</div>
                        <div class='avatar' style='background-image: url("${avatar}");'></div>
                        <div class='msg-sender-name' style='color: ${sender.nameColor || '#dcdcdc'}'>${inHTMLData(sender.name)}</div>
                    </div>
                    <div class='msg-content msg-whisper'><i>(whispers to ${this.getPlayer(msg.target).name})</i> ${inHTMLData(msg.content)}</div>
                </div>
            `);
        }
        else if (msg.quote && sender) { //quote
            let avatar = sender.profileImg; //avatarUrl(sender.dId, sender.avatar, sender.tag);
            messageHtml = $(`
                <div class='msg ${this.settings.largeText ? 'msg-large' : ''}'>
                    <div class='msg-sender'>
                        <div class='msg-time'>${msg.time}</div>
                        <div class='avatar' style='background-image: url("${avatar}");'></div>
                        <div class='msg-sender-name' style='color: ${sender.nameColor || '#dcdcdc'}'>${inHTMLData(sender.name)}</div>
                    </div>
                    <div class='msg-content msg-quote'>
                        <i class='fas fa-quote-left'></i>
                        ${msg.originalMsg.time} ${msg.originalMsg.sender ? msg.originalMsg.sender.name : 'Anonymous'}:
                        ${inHTMLData(msg.originalMsg.content)}
                        <i class="fas fa-quote-right"></i>
                    </div>
                </div>
            `);
        }
        else if (msg.quote && !sender) { //anonymous quote
            messageHtml = $(`
                <div class='msg ${this.settings.largeText ? 'msg-large' : ''}'>
                    <div class='msg-sender'>
                        <div class='msg-time'>${msg.time}</div>
                        <div class='avatar' style='background-image: url("/images/defaultProfile.png");'></div>
                        <div class='msg-sender-name'>Anonymous</div>
                    </div>
                    <div class='msg-content msg-quote'>
                        <i class='fas fa-quote-left'></i>
                        ${msg.originalMsg.time} ${msg.originalMsg.sender ? msg.originalMsg.sender.name : 'Anonymous'}
                        ${inHTMLData(msg.originalMsg.content)}
                        <i class="fas fa-quote-right"></i>
                    </div>
                </div>
            `);
        }
        else if (!msg.server && !sender) { //anonymous message
            let color = greentext ? '#9bd062' : metext ? '#9b9b9b' : '#dcdcdc';
            messageHtml = $(`
                <div class='msg ${this.settings.largeText ? 'msg-large' : ''}' data-id='${msg.id}'>
                    <div class='msg-sender'>
                        <div class='msg-time'>${msg.time}</div>
                        <div class='avatar' style='background-image: url("/images/defaultProfile.png");'></div>
                        <div class='msg-sender-name'>Anonymous</div>
                    </div>
                    <div class='msg-content quotable ${metext ? 'metext' : ''}' data-id='${msg.id}' style='color: ${color}'>${inHTMLData(msg.content)}</div>
                </div>
            `);
        }
        else if (msg.server) { //server message
            messageHtml = $(`
                <div class='msg ${this.settings.largeText ? 'msg-large' : ''}'>
                    <div class='msg-content msg-server'>${inHTMLData(msg.content)}</div>
                </div>
            `);
        }

        let msgContent = messageHtml.find('.msg-content');
        msgContent.html(insertEmojis(msgContent.html(), this.serverEmojis.concat(sender ? sender.emojis : [])));

        if(!msg.server){
            $('.speech-display').append(messageHtml);
        }
        if(msg.server){
            // $('.console-list').append(messageHtml.html());
        }
        this.autoScroll();
    }

    changeState (newState) {
        if (newState <= this.stateCount && newState >= 0) {
            this.stateView = newState;
            this.renderMeetingTabs(newState);
            this.renderAllActions(newState);
            this.renderState(newState);

            let stateName = this.history[newState].name.split('-')[0].split(' ').join('-');
            $('body').attr('class', stateName);
            $('.logo').attr('class', `logo ${stateName}`);

            for (let state in this.history[newState].stateMods) {
                if (this.history[newState].stateMods[state]) {
                    $('body').attr('class', state.split(' ').join('-'));
                    $('.logo').attr('class', `logo ${state.split(' ').join('-')}`);
                }
            }
        }
    }

    autoScroll () {
        if (!this.manualScroll) {
            let messages = $('.speech-display')[0];
            messages.scrollTop = messages.scrollHeight;

            let logs = $('.console-list')[0];
            logs.scrollTop = logs.scrollHeight;
        }
    }

    setVolume (val) {
        for (let soundName in this.audio)
            this.audio[soundName].volume = val;
    }

    test (times) {
        for (let i = 0; i < times; i++)
            window.open(`/game/${this.id}?test=true`);
    }

    devlog (msg) {
        if (this.development)
            console.log(new Date(), msg);
    }

}
