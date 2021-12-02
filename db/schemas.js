var mongoose = require('mongoose');

var schemas = {
    'User': new mongoose.Schema({
        dId: {type: String, index: true},
        name: String,
        tag: String,
        avatar: String,
        wins: {type: Number, default: 0},
        losses: {type: Number, default: 0},
        bio: String,
        banner: String,
        mod: {type: Boolean, default: false},
        dev: {type: Boolean, default: false},
        ban: {type: mongoose.Schema.Types.ObjectId, ref: 'Ban'},
        ticketBanned: {type: Boolean, default: false},
        setups: [{type: mongoose.Schema.Types.ObjectId, ref: 'Setup'}],
        favSetups: [{type: mongoose.Schema.Types.ObjectId, ref: 'Setup'}],
        games: [{type: mongoose.Schema.Types.ObjectId, ref: 'Game'}],
        rankPoints: {type: Number, index: true, default: 0},
        points: {type: Number, default: 0},
        ip: [{type: String, index: true}],
        referred: Boolean,
        userReferrals: [{type: String}],
        textColors: Boolean,
        nameColor: String,
        speechColor: String,
        emojis: {type: Map, of: Number},
        emojiPacks: {type: Map, of: Number},
        profileImg: {type:String,default:"/images/defaultProfile.png"}
    }),
    'Setup': new mongoose.Schema({
        id: {type: String, index: true},
        hash: {type: String, index: true},
        name: {type: String, index: true},
        creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        closed: Boolean,
        unique: Boolean,
        roles: String,
        count: {type: Map, of: Number},
        total: Number,
        startState: {type: String, default: "night"},
        whispers: {type: Boolean, default: false},
        leakPercentage: {type: Number, default: 0},
        lastWill: {type: Boolean, default: false},
        mustAct: {type: Boolean, default: false},
        noReveal: {type: Boolean, default: false},
        favorites: {type: Number, default: 0},
        played: {type: Number, index: true, default: 0},
        featured: {type: Boolean, index: true, default: false}
    }),
    'Game': new mongoose.Schema({
        id: {type: String, index: true},
        setup: {type: mongoose.Schema.Types.ObjectId, ref: 'Setup'},
        players: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        names: [String],
        roles: [String],
        winners: [String],
        history: String,
        timeStart: Number,
        timeEnd: Number,
        ranked: Boolean,
        stateLengths: {type: Map, of: Number}
    }),
    'Role': new mongoose.Schema({
        name: String,
        alignment: {type: String, default: 'village'},
        description: [String],
        disabled: {type: Boolean, default: false}
    }),
    'Ticket': new mongoose.Schema({
        id: String,
        creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        message: String,
        created: Date,
        open: {type: Boolean, default: true}
    }),
    'Ban': new mongoose.Schema({
        reason: String,
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        created: Number,
        length: Number
    }),
    'BetaTester': new mongoose.Schema({
        dId: {type: String, index: true},
        name: String
    }),
    'Emoji': new mongoose.Schema({
        name: String,
        url: String,
        server: Boolean,
        inPacks: Boolean,
        rarity: Number
    }),
    'Session': new mongoose.Schema({
        session: String,
        expires: Date,
        lastModified: Date
    }),
    'Restart': new mongoose.Schema({
        time: Number
    })
};

module.exports = schemas;
