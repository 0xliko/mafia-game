module.exports = function (type, name) {
    let templates = {
        'basic': `${name} was killed`,
        'lynch': `${name} was killed by the town`,
        'sui': `${name} commits suicide`,
        'gun': `${name} collapses to the ground from a gunshot wound`,
        'poison': `${name} finally succumbs to poison`,
        'lynchRevenge': `${name} was killed in an act of revenge`,
        'bomb': `${name} explodes into a thousand pieces`,
    };

    return templates[type];
};
