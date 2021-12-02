var passport = require('passport');
var rp = require('request-promise');
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const passportDiscord  = require("passport-discord");
var models = require('./db/models');
const scopes = ['identify', 'email']
const DiscordStrategy = passportDiscord.Strategy
passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: `${process.env.DISCORD_OAUTH_REDIRECT}`,
    passReqToCallback: true,
    scope: scopes
}, async function (req, accessToken, refreshToken, profile, done) {
    console.log(profile,done);
    try {
        //let isBetaTester = await models.BetaTester.findOne({dId: identity.id})
        if (/*isBetaTester*/true) {
            let user = await models.User.findOne({dId: profile.id});
            var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

            if (!user) {
                user = new models.User({
                    dId: profile.id,
                    name: profile.username,
                    tag: profile.discriminator,
                    avatar: profile.avatar,
                    ip: [ip]
                });
                await user.save();

                console.log(req.session.ref);
                if (req.session.ref)
                    await models.User.update({dId: req.session.ref}, {$addToSet: {userReferrals: identity.id}});
            }
            else
                await models.User.update({dId: profile.id}, {$addToSet: {ip: ip}}).exec();

            done(null, {_id: user._id, dId: user.dId});
        }
        else
            done(null, {});
    }
    catch (e) {
        console.error(e);
        done(null, {});
    }
}));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

module.exports = passport;
