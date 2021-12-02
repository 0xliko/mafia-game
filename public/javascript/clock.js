class Clock {

    constructor (game, digital) {
        this.game = game;
        this.digital = digital;
        this.started = false;
        this.stepInterval = null;
        this.stepRate = 1000;
        this.lastStep = 0;
        this.radius = 50;
        this.states = {};
        this.stateArr = [];
        this.time = 0;
        this.totalTime = 0;
        this.thirtySecAlert = false;
        this.tenSecAlert = false;
    }

    setLengths (states) {
        this.totalTime = 0;

        for (let state of states)
            this.totalTime += state.length;
        for (let i in states) {
            let state = states[i];
            this.states[state.name] = {
                index: i,
                name: state.name,
                length: (2 * Math.PI) * (state.length / this.totalTime),
            };
        }

        this.stateArr = Object.values(this.states).sort((a, b) => a.index - b.index);
    }

    start () {
        this.lastStep = Date.now();
        this.stepInterval = setInterval(() => {this.step()}, this.stepRate);
        this.started = true;
    }

    stop () {
        clearInterval(this.stepInterval);
        this.started = false;
    }
    setTime (time) {
        let timeInSeconds, prevTimeInSeconds = this.time / 1000;
        this.time = time;
        timeInSeconds = this.time / 1000;

        if (prevTimeInSeconds < 30 && timeInSeconds > 35)
            this.thirtySecAlert = false;

        if (prevTimeInSeconds < 10 && timeInSeconds > 15)
            this.tenSecAlert = false;
    }

    step () {
        let now = Date.now();

        this.time -= (now - this.lastStep);
        this.lastStep = now;

        this.render();

        let timeInSeconds = this.time / 1000;

        if (timeInSeconds <= 30 && !this.thirtySecAlert) {
            this.game.showAlert('30 seconds remaining');
            this.thirtySecAlert = true;
            game.thirtySecAlert();
        }

        if (timeInSeconds <= 10 && !this.tenSecAlert) {
            //this.game.showAlert('10 seconds remaining');
            this.tenSecAlert = true;
        }

        if (Math.round(timeInSeconds) <= 10 && Math.round(timeInSeconds) >= 0 && this.game.settings.clockTick) {
            //this.game.audio.tick.play();
        }

        // $('.clock').attr('data-original-title', Math.round(timeInSeconds));
        //$(`#${$('.clock').attr('aria-describedby')}`).find('.tooltip-inner').text(Math.round(timeInSeconds));
    }

    render () {

        if (this.game.state != 'pregame')
        this.drawHand();
    }
    drawHand () {

        if( this.time <= 120 * 1000){

            this.digital.show();
            const time = Math.max(0,Math.floor(this.time / 1000));
            const minute = Math.floor(time/ 60);
            const second = time % 60;

            const topSecond = Math.floor(second / 10)
            const bottomSecond = second % 10;
            const timeString = `${minute}:${topSecond}${bottomSecond}`;
            this.digital.text(timeString);
        } else{
            this.digital.hide();
        }
    }



}
