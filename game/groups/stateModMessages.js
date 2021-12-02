module.exports = function (mod) {
    let templates = {
        'full moon': `A full moon lights the night sky`,
        'eclipse': `An eclipse is occurring`,
    };

    return templates[mod];
};
