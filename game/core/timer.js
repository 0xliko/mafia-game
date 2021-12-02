module.exports = class Timer {

    constructor (done, delay) {
        this.delay = delay;
        this.start = Date.now();
        this.done = done;
        this.timeout = setTimeout(done, delay);
    }

    timeLeft () {
        return this.delay - (Date.now() - this.start);
    }

    timePassed () {
        return Date.now() - this.start;
    }

    stop () {
        clearTimeout(this.timeout);
    }

    end (cb) {
        this.stop();
        this.done();
    }

}
