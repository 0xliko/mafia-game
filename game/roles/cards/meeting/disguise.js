const RoleCard = require('../../../core/roleCard');

module.exports = class Disguise extends RoleCard {

    constructor (role) {
        super(role);

        this.meetings = {
            'Disguise': {
                type: 'Solo',
                times: Infinity,
                state: 'night',
                group: false,
                voteWeight: 1,
                canVote: true,
                canSeeVotes: true,
                targetType: 'list',
                targets: ['Yes', 'No'],
                action: {
                    labels: ['disguise'],
                    visit: true,
                    priority: -50,
                    do: (self) => {
                        if (self.target == 'Yes')
                            self.actor.role.disguise = true;
                    }
                }
            }
        };
        this.reverseGuise = () => {
            let idList = Object.keys(this.role.disguiseHistory || {}).reverse();
            for (let playerId of idList) {
                let original = this.role.game.getPlayer(playerId);
                let guised = this.role.disguiseHistory[playerId];
                let temp = {
                    user: original.user,
                    role: original.role,
                    items: original.items,
                    effects: original.effects,
                    history: original.history,
                    alive: original.alive
                };

                delete original.swappedWith;
                original.user = guised.user;
                original.role = guised.role;
                original.items = guised.items;
                original.effects = guised.effects;
                original.history = guised.history;
                original.alive = guised.alive;
                original.user.player = original;
                original.role.player = original;
                for (let item of original.items)
                    item.player = original;
                for (let effect of original.effects)
                    effect.player = original;
                original.emit('self', original.id);

                delete guised.swappedWith;
                guised.user = temp.user;
                guised.role = temp.role;
                guised.items = temp.items;
                guised.effects = temp.effects;
                guised.history = temp.history;
                guised.alive = temp.alive;
                guised.user.player = guised;
                guised.role.player = guised;
                for (let item of guised.items)
                    item.player = guised;
                for (let effect of guised.effects)
                    effect.player = guised;
                guised.emit('self', guised.id);

                this.role.game.emit('reveal', guised.id, guised.role.appearance.death);
            }

            this.role.game.emit('reveal', this.role.player.id, this.role.appearance.death);
            this.role.disguiseHistory = null;
        };
        this.listeners = {
            mafiaKill: {
                reaction: (action) => {
                    if (this.role.disguise) {
                        //Set up references
                        let disguiserPlayer = this.role.player;
                        let targetPlayer = action.target;
                        let temp = {
                            user: disguiserPlayer.user,
                            role: disguiserPlayer.role,
                            items: disguiserPlayer.items,
                            effects: disguiserPlayer.effects,
                            history: disguiserPlayer.history
                        };

                        //Swap the player objects
                        disguiserPlayer.swappedWith = targetPlayer;
                        disguiserPlayer.user = targetPlayer.user;
                        disguiserPlayer.role = targetPlayer.role;
                        disguiserPlayer.items = targetPlayer.items;
                        disguiserPlayer.effects = targetPlayer.effects;
                        disguiserPlayer.history = targetPlayer.history;
                        disguiserPlayer.user.player = disguiserPlayer;
                        disguiserPlayer.role.player = disguiserPlayer;
                        for (let item of disguiserPlayer.items)
                            item.player = disguiserPlayer;
                        for (let effect of disguiserPlayer.effects)
                            effect.player = disguiserPlayer;

                        targetPlayer.swappedWith = disguiserPlayer;
                        targetPlayer.user = temp.user;
                        targetPlayer.role = temp.role;
                        targetPlayer.items = temp.items;
                        targetPlayer.effects = temp.effects;
                        targetPlayer.history = temp.history;
                        targetPlayer.user.player = targetPlayer;
                        targetPlayer.role.player = targetPlayer;
                        for (let item of targetPlayer.items)
                            item.player = targetPlayer;
                        for (let effect of targetPlayer.effects)
                            effect.player = targetPlayer;

                        //Swap action actors and targets
                        for (let action of this.role.game.actionQueue[0]) {
                            if (action.actor == disguiserPlayer)
                                action.actor = targetPlayer;
                            else if (action.actor == targetPlayer)
                                action.actor = disguiserPlayer;

                            if (action.priority >= -1) {
                                if (action.target == targetPlayer)
                                    action.target = disguiserPlayer;
                                else if (action.target == disguiserPlayer)
                                    action.target = targetPlayer;
                            }
                        }

                        //Emit to the two players who the guiser is
                        this.role.oldSelf = disguiserPlayer;
                        disguiserPlayer.emit('reveal', targetPlayer.id, targetPlayer.role.name);
                        targetPlayer.emit('reveal', targetPlayer.id, targetPlayer.role.name);
                        targetPlayer.emit('self', targetPlayer.id);
                        this.role.game.alertPlayer(`${disguiserPlayer.name} has stolen your identity!`, targetPlayer, true);

                        //Save guise history
                        if (!this.role.disguiseHistory)
                            this.role.disguiseHistory = {};
                        this.role.disguiseHistory[disguiserPlayer.id] = targetPlayer;
                    }
                },
                aliveOnly: true,
                override: false
            },
            state: {
                reaction: (state, day, stateCount) => {
                    if (this.role.disguise) {
                        this.role.disguise = false;

                        for (let alert of this.role.game.alertQueue) {
                            if (alert.recipients && alert.recipients.length == 1) {
                                if (alert.recipients[0] == this.role.oldSelf)
                                    alert.recipients = [this.role.player];
                                else if (alert.recipients[0] == this.role.player)
                                    alert.recipients = [this.role.oldSelf];
                            }
                        }
                    }
                },
                aliveOnly: true,
                override: false
            },
            afterKill: {
                reaction: (player, how, killer, visit, absolute, instant) => {
                    if (player == this.role.player && !this.role.game.setup.noReveal) {
                        this.reverseGuise();
                        if (!this.role.game.setup.noReveal) {
                            if (instant)
                                this.role.game.sendAlert(`${this.role.player.name}'s deception as the Disguiser has come to an end!`);
                            else
                                this.role.game.alertQueue.push({msg: `${this.role.player.name}'s deception as the Disguiser has come to an end!`});
                        }
                    }

                },
                aliveOnly: false,
                override: false
            },
            endGame: {
                reaction: this.reverseGuise,
                aliveOnly: false,
                override: false
            }
        };
    }

}
