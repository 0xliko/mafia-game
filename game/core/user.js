module.exports = class User {

    constructor (userObj, socket) {
        this._id = userObj._id;
        this.id = userObj.dId;
        this.name = userObj.name;
        this.avatar = userObj.avatar;
        this.profileImg = userObj.profileImg;
        this.tag = userObj.tag;
        this.mod = userObj.mod;
        this.dev = userObj.dev;
        this.nameColor = userObj.nameColor;
        this.speechColor = userObj.speechColor;
        this.emojis = this.parseEmojis(userObj.emojis);
        this.socket = socket;
        this.player = null;
    }

    emit () {
        if (this.socket)
            this.socket.emit(...arguments);
    }

    parseEmojis (emojiMap) {
        let res = [];

        if (emojiMap) {
            for (let key of emojiMap.keys()) {
                if (emojiMap.get(key) > 0)
                    res.push(key);
            }
        }

        return res;
    }

}
