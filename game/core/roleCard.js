module.exports = class RoleCard {

    constructor (role) {
        this.role = role;
        //this.alignment
        //this.revealOnDeath
        //this.winCheck
        //this.winCount
        this.appearance = {};
        this.startItems = [];
        this.effects = [];
        this.immunity = {};
        this.meetings = {};
        this.listeners = {};
        this.newStates = {};
        this.props = {};
        this.overrides = {/* winCheck, appearance, startItems, effects, immunity, meetings, newStates */};
    }

    init () {
        let attributes = ['alignment', 'winCount', 'winCheck', 'appearance', 'startItems', 'effects', 'immunity', 'visit', 'meetings', 'listeners', 'newStates', 'props'];

        for (let key of attributes) {
            if (Array.isArray(this[key])) {
                if (this.overrides[key])
                    this.role[key] = this[key];
                else
                    this.role[key] = this.role[key].concat(this[key]);
            }
            else if (key == 'listeners') {
                for (let eventName in this.listeners) {
                    let cardListener = this.listeners[eventName];
                    let roleListeners = this.role.listeners[eventName];
                    let roleListenerAmt = roleListeners ? roleListeners.length : 0;

                    if (cardListener.override && roleListenerAmt) {
                        for (let listener of roleListeners)
                            this.role.events.removeListener(eventName, listener.reaction);
                        roleListeners = this.role.listeners[eventName] = [];
                    }

                    if (!roleListeners)
                        roleListeners = this.role.listeners[eventName] = [];
                    this.role.listeners[eventName].push(cardListener);
                    this.role.events.on(eventName, cardListener.reaction);
                }
            }
            else if (key == 'props') {
                for (let propName in this.props)
                    this.role[propName] = this.props[propName];
            }
            else if (this[key] && typeof this[key] == 'object') {
                if (this.overrides[key])
                    this.role[key] = this[key];
                else {
                    for (let prop in this[key])
                        this.role[key][prop] = this[key][prop];
                }
            }
            else {
                if (this[key])
                    this.role[key] = this[key];
            }
        }

        /*
            Overrides
            ---------
            If array, replace if override, concat if not.
            If object, replace if override, set individual properties if not.
            If listeners, turn off existing of same name if override, turn on alongside if not.
            Properties alwasy override if already set.
        */
    }

    speak (message) {return message}

    hear (message) {return message}

    seeVote (vote) {return vote}

}
