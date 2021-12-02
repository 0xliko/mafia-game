const Group = require('../meetings/group');
const GroupSpeech = require('../meetings/groupSpeech');
const GroupVote = require('../meetings/groupVote');
const GroupSpeechVote = require('../meetings/groupSpeechVote');

const Solo = require('../meetings/solo');
const SoloSaver = require('../meetings/soloSaver');
const SoloInstant = require('../meetings/soloInstant');

const Pregame = require('../meetings/pregame');
const Village = require('../meetings/village');

module.exports = {
    'Group': Group,
    'GroupSpeech': GroupSpeech,
    'GroupVote': GroupVote,
    'GroupSpeechVote': GroupSpeechVote,
    'Solo': Solo,
    'SoloSaver': SoloSaver,
    'SoloInstant': SoloInstant,
    'Pregame': Pregame,
    'Village': Village,
};
