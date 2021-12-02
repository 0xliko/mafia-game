module.exports = class Action {

    constructor (labels, actor, target, visit, priority, run, meeting) {
        this.game = actor.game;
        this.labels = labels;
        this.actor = actor;
        this.target = target;
        this.visit = visit;
        this.priority = priority || 0;
        this.run = run;
        this.meeting = meeting || {};
    }

    do () {
        this.run(this);
    }

    hasLabel (label) {
        return this.labels.indexOf(label) != -1;
    }

    hasLabels (labelArr) {
        for (let label of labelArr) {
            if (this.labels.indexOf(label) == -1)
                return false;
        }
        return true;
    }

    nullify (clearInfo) {
        this.do = () => {};
        if (clearInfo) {
            delete this.actor;
            delete this.target;
        }
    }

}
