var models = require('./db/models');

module.exports = async function () {
    var roleData = {
        //Village
        'Villager': {
            alignment: 'village',
            description: [
                'Wins when no mafia or malevolent independents remain.'
            ],
            disabled: false
        },
        'Doctor': {
            alignment: 'village',
            description: [
                'Save one person each night from dying.'
            ],
            disabled: false
        },
        'Arms Dealer': {
            alignment: 'village',
            description: [
                'Hands out a gun each night.'
            ],
            disabled: false
        },
        'Cop': {
            alignment: 'village',
            description: [
                'Investigates one person each night and learns their alignment.',
                'Multiple cops meet in a group.'
            ],
            disabled: false
        },
        'Oracle': {
            alignment: 'village',
            description: [
                'Chooses one player each night.',
                'The most recently chosen player will be revealed upon the oracle\'s death'
            ],
            disabled: false
        },
        'Vigilante': {
            alignment: 'village',
            description: [
                'Kills one person each night.'
            ],
            disabled: false
        },
        'Seer': {
            alignment: 'village',
            description: [
                'Lears the role of one person each night.',
            ],
            disabled: false
        },
        'Escort': {
            alignment: 'village',
            description: [
                'Each night, chooses one person and blocks them from performing any actions.',
            ],
            disabled: false
        },
        'Blacksmith': {
            alignment: 'village',
            description: [
                'Hands out armor to one player each night.',
                'Armor can block a single bullet.'
            ],
            disabled: false
        },
        'Archer': {
            alignment: 'village',
            description: [
                'When lynched, can choose someone to kill.'
            ],
            disabled: false
        },
        'Watcher': {
            alignment: 'village',
            description: [
                'Watches someone each night and learns who visits them.'
            ],
            disabled: false
        },
        'Tracker': {
            alignment: 'village',
            description: [
                'Tracks someone each night and learns who they visit.'
            ],
            disabled: false
        },
        'Monkey': {
            alignment: 'village',
            description: [
                'Each night can steal the actions of a player and do them itself.',
                'Actions performed by the monkey cannot be blocked.',
                'Cannot be role blocked.'
            ],
            disabled: false
        },
        'Agent': {
            alignment: 'village',
            description: [
                'Attempts to guess the identity of the spy each night.',
                'Kills the spy if guess is successful.'
            ],
            disabled: false
        },
        'Sheriff': {
            alignment: 'village',
            description: [
                'Starts with a gun.',
                'This gun will always reveal the sheriff when shot.'
            ],
            disabled: false
        },
        'Deputy': {
            alignment: 'village',
            description: [
                'Starts with a gun.',
                'This gun will never reveal the deputy when shot.'
            ],
            disabled: false
        },
        'Knight': {
            alignment: 'village',
            description: [
                'Starts with armor.',
            ],
            disabled: false
        },
        'Bomb': {
            alignment: 'village',
            description: [
                'If a player kills the bomb they will also die.',
            ],
            disabled: false
        },
        'Village Idiot': {
            alignment: 'village',
            description: [
                'Sees all speech as coming from random people.',
                'Appears as villager to self.'
            ],
            disabled: false
        },
        'Medic': {
            alignment: 'village',
            description: [
                'Can save one person each night from dying, including themself.'
            ],
            disabled: false
        },
        'Babushka': {
            alignment: 'village',
            description: [
                'Kills all who visit her during the night.',
                'Cannot be killed.'
            ],
            disabled: false
        },
        'Illuminato': {
            alignment: 'village',
            description: [
                'Meets with other Illuminati members during the night.'
            ],
            disabled: false
        },
        'Suspect': {
            alignment: 'village',
            description: [
                'Appears as villager to self.',
                'Appears as mafia to investigative roles.',
                'Appears as mafioso upon being lynched.',
                'Appears as suspect upon being killed.',
            ],
            disabled: false
        },

        //Mafia
        'Mafioso': {
            alignment: 'mafia',
            description: [
                'Wins when the mafia outnumbers all other players.'
            ],
            disabled: false
        },
        'Chemist': {
            alignment: 'mafia',
            description: [
                'Concocts a deadly poison and administers it to one person each night.',
                'The poisoned target will die at the end of the following night.'
            ],
            disabled: false
        },
        'Stalker': {
            alignment: 'mafia',
            description: [
                'Stalks one person each night and learns their role.',
            ],
            disabled: false
        },
        'Hooker': {
            alignment: 'mafia',
            description: [
                'Each night, chooses one person and blocks them from performing any actions.',
            ],
            disabled: false
        },
        'Godfather': {
            alignment: 'mafia',
            description: [
                'Leads the mafia kill each night.',
                'Appears innocent on cop reports and as a villager to seers.',
            ],
            disabled: false
        },
        'Driver': {
            alignment: 'mafia',
            description: [
                'Each night, chooses two targets, A and B.',
                'Players who visit A will be redirected to B, and players who visit B will be redirected to A.',
                'Does not visit.',
                'Redirection cannot be role blocked.'
            ],
            disabled: false
        },
        'Spy': {
            alignment: 'mafia',
            description: [
                'Attempts to guess the identity of the agent each night.',
                'Kills the agent if guess is successful.'
            ],
            disabled: false
        },
        'Lawyer': {
            alignment: 'mafia',
            description: [
                'Chooses a fellow mafia member each night and makes them appear innocent on cop reports.'
            ],
            disabled: false
        },
        'Disguiser': {
            alignment: 'mafia',
            description: [
                'Steals the identity of the person killed by the mafia each night.'
            ],
            disabled: false
        },

        //Monsters
        'Lycan': {
            alignment: 'monsters',
            description: [
                'Invincible during full moons and eclipses.',
                'Each night, bites a non-monster player and turns them into a werewolf.',
                'Werewolves retain their original roles, but they unknowingly kill a random non-monster player on full moons.'
            ],
            disabled: false
        },
        'Witch': {
            alignment: 'monsters',
            description: [
                'Can choose a player to control.',
                'Chooses who that player will perform their actions on.',
                'Redirection cannot be role blocked.',
                'Causes an eclipse during the day following her death.',
                'All votes and speech are anonymous during an eclipse.'
            ],
            disabled: false
        },
        'Cthulhu': {
            alignment: 'monsters',
            description: [
                'All who visit the Cthulhu go insane.'
            ],
            disabled: false
        },

        //Independent
        'Jester': {
            alignment: 'independent',
            description: [
                'Wins if lynched by the town.'
            ],
            disabled: false
        },
        'Serial Killer': {
            alignment: 'independent',
            description: [
                'Must kill a player each night.',
                'Wins if among last two alive.'
            ],
            disabled: false
        },
        'Amnesiac': {
            alignment: 'independent',
            description: [
                'Once per game can become the role of a dead player.'
            ],
            disabled: false
        },
    };

    try {
        let roles = await models.Role.find();
        var roleNames = roles.map(role => role.name);

        for (var roleName in roleData) {
            if (roleNames.indexOf(roleName) == -1) {
                var role = new models.Role({
                    name: roleName,
                    alignment: roleData[roleName].alignment,
                    description: roleData[roleName].description,
                    disabled: roleData[roleName].disabled
                });
                role.save();
            }
        }
    }
    catch (e) {
        console.error(e);
    }
};
