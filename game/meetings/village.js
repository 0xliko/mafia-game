const Meeting = require('../core/meeting');

module.exports = class Village extends Meeting {

    constructor (name, game) {
        super('Village', game);

        this.displayName = 'Village';
        this.group = true;
        this.speech = true;
        this.voting = true;
        this.targets.include = ['alive'];
    }

    unvote (voter) {
        super.unvote(voter);

        if (Object.keys(this.votes).length < this.members.length - 1 && this.game.timers.secondary) {
            this.game.timers.secondary.stop();
            this.game.timers.secondary = null;
            this.game.syncClients();
        }
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
            if (member.canVote) {
                delete this.votes[player.id];
                this.totalVoters--;
            }

            member.canTalk = false;
            member.canVote = false;
        }
    }

}
