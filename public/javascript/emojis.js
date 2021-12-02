function extractEmojiCodes (str) {
    var emojis = [];
    var inEmoji = false;
    var currentEmoji = '';

    for (var c of str) {
        if (c == ':')
            inEmoji = !inEmoji;
        else if (inEmoji)
            currentEmoji += c;

        if (!inEmoji && currentEmoji.length) {
            emojis.push(currentEmoji);
            currentEmoji = '';
        }
    }

    return emojis;
}

function insertEmojis (str, validEmojis) {
    var emojis = extractEmojiCodes(str.toLowerCase());
    for (var emoji of emojis) {
        if (validEmojis.indexOf(emoji) != -1)
            str = str.replace(new RegExp(`:${emoji}:`, 'i'), `<span class='emoji' style='background-image: url("${emojiImages[emoji]}")'></span>`);
    }
    return str;
}

var emojiImages = {
    'arc': '/images/emojis/arc.png'
};
