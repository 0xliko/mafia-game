var clickPoptagOpen = false;
var generatePopover = function (el, innerPop) {
    var poptag = $(el);
    var id = poptag.data('id');
    var type = poptag.data('type');
    var popover = $(`.popover-body:contains('pop-${id}')`);

    if (popover.length) {
        popover.html('');
        var loadWheel = setTimeout(() => {popover.html('<div class="loading-wheel"></div>')}, 500);
        switch (type) {
            case 'user':
                $.get(`/user/${id}/info`, function (player) {
                    clearTimeout(loadWheel);
                    popover.html(`
                        <ul class='list-unstyled player-popover-info'>
                            <li>
                                <strong>Tag</strong>
                                <div>#${player.tag}</div>
                            </li>
                            <li>
                                <strong>Ranked Win Rate</strong>
                                <div>${Math.round(player.wins / (player.wins + player.losses) * 100) || 0}</div>
                            </li>
                            <li>
                                <strong>In Game</strong>
                                <div>${player.inGame}</div>
                            </li>
                        </ul>
                    `);

                    poptag.data('bs.popover')._popper.update();
                });
                break;
            case 'setup':
                var rolePop = poptag.data('rolepop');
                $.get(`/setup/${id}`, setup => {
                    clearTimeout(loadWheel);
                    setup.roles = JSON.parse(setup.roles);
                    popover.html(`
                        <ul class='list-unstyled setup-info'>
                            <li>
                                <strong>Starting State</strong>
                                <div><i class="fas fa-${setup.startState == 'day' ? 'sun' : 'moon'} iSmall"></i></div>
                            </li>
                            <li>
                                <strong>Whispers</strong>
                                <div>
                                    <div>${setup.whispers ? 'Yes' : 'No'}</div>
                                    ${setup.whispers ? `<div>${setup.leakPercentage}% leak rate</div>` : ''}
                                </div>
                            </li>
                            <li>
                                <strong>Last Will</strong>
                                <div>${setup.lastWill ? 'Yes' : 'No'}</div>
                            </li>
                            <li>
                                <strong>Must Act</strong>
                                <div>${setup.mustAct ? 'Yes' : 'No'}</div>
                            </li>
                            <li>
                                <strong>No Reveal</strong>
                                <div>${setup.noReveal ? 'Yes' : 'No'}</div>
                            </li>
                        </ul>
                    `);

                    var list = popover.find('.setup-info');

                    if (setup.creator) {
                        var creatorLi = $(`
                            <li>
                                <strong>Created by</strong>
                                <div class='pop-player'>
                                    <span class='avatar-small' style='background-image: url("${avatarUrl(setup.creator.dId, setup.creator.avatar, setup.creator.tag)}")'></span>
                                    <span class='username-small'>${inHTMLData(setup.creator.name)}</span>
                                </div>
                            </li>
                        `);
                        list.prepend(creatorLi);
                    }

                    if (!setup.closed) {
                        list.append(`
                            <li>
                                <strong>Role Sets</strong>
                                <div class='rolesets'></div>
                            </li>
                        `);

                        for (var roleset of setup.roles) {
                            var setupHtml = $(`<div class='setup'></div>`);
                            let rolesets = list.find('.rolesets');
                            rolesets.append(formatSetup(setupHtml, [roleset], false, null, false, true, true, rolePop));

                            if (setup.roles.indexOf(roleset) != setup.roles.length - 1)
                            rolesets.append('<hr />');
                        }
                    }

                    if (setup.closed) {
                        list.append(`
                            <li>
                                <strong>Unique Roles</strong>
                                <div>${capitalize(String(setup.unique))}</div>
                            </li>
                        `);

                        for (var alignment in setup.roles) {
                            if (setup.roles[alignment].length) {
                                var html = $(`
                                    <li>
                                        <strong>${capitalize(alignment)} Roles</strong>
                                        <div class='roleList' style='display: flex;'></div>
                                    </li>
                                `);

                                for (var role of setup.roles[alignment]) {
                                    html.find('.roleList').append(`
                                        <div tabindex='0' class='role-count-wrap ${rolePop ? 'poptag' : ''}' data-toggle='popover' data-trigger='focus' data-type='role' data-id='${role}' title='${role}' data-content='pop-${role}'>
                                            <div class='role-small role-${roleName(role)}' data-toggle='tooltip' title='${role}'></div>
                                        </div>
                                    `);
                                }

                                // html.find('.role-count-wrap.poptag').popover();
                                html.find('.role-small').tooltip();
                                list.append(html);
                            }
                        }
                    }

                    poptag.data('bs.popover')._popper.update();
                });
                break;
            case 'role':
                if (id != null) {
                    $.get(`/roles/${id}`, function (role) {
                        clearTimeout(loadWheel);
                        popover.html(`
                            <ul class='list-unstyled role-info'>
                                <li>
                                    <strong>Alignment</strong>
                                    <div>${capitalize(role.alignment)}</div>
                                </li>
                                <li>
                                    <strong>Description</strong>
                                    <ul class='role-desc'></ul>
                                </li>
                            </ul>
                        `);

                        var description = popover.find('.role-desc');
                        for (var line of role.description)
                            description.append(`<li>${line}</li>`);
                    });
                }
                else {
                    clearTimeout(loadWheel);
                    popover.html('Role is unkown');
                }
                break;
            case 'game':
                $.get(`/game/${id}/info`, function (game) {
                    clearTimeout(loadWheel);
                    if (!game.error) {
                        var list = $(`
                            <ul class='list-unstyled game-info-pop'>
                                <li>
                                    <strong>Players</strong>
                                    <div class='players-pop'></div>
                                </li>
                                <li>
                                    <strong>State Lengths</strong>
                                    <div class='state-lengths-pop'></div>
                                </li>
                            </ul>
                        `);
                        popover.html(list);

                        if (game.createTime) {
                            list.append(`
                                <li>
                                    <strong>Created At</strong>
                                    <div>${(new Date(game.createTime)).toLocaleString()}</div>
                                </li>
                            `);
                        }

                        if (game.timeStart) {
                            list.append(`
                                <li>
                                    <strong>Started At</strong>
                                    <div>${(new Date(game.timeStart)).toLocaleString()}</div>
                                </li>
                            `);
                        }

                        if (game.timeEnd) {
                            list.append(`
                                <li>
                                    <strong>Ended At</strong>
                                    <div>${(new Date(game.timeEnd)).toLocaleString()}</div>
                                </li>
                            `);
                        }

                        var players = popover.find('.players-pop');
                        for (let player of game.players) {
                            players.append(`
                                <div class='pop-player'>
                                    <div class='avatar-small' style='background-image: url("${avatarUrl(player.dId, player.avatar, player.tag)}")'></div>
                                    <div class='username-small'>${inHTMLData(player.name)}</div>
                                </div>
                            `);
                        }

                        var stateLengths = popover.find('.state-lengths-pop');
                        for (let stateName in game.stateLengths) {
                            let length = game.stateLengths[stateName];
                            stateLengths.append(`
                                <div>${capitalize(stateName)}: ${Number(length) / 1000 / 60} minutes</div>
                            `);
                        }
                    }
                    else
                        popover.html('Error loading game');

                    poptag.data('bs.popover')._popper.update();
                });
                break;
        }
    }
};

$('.poptag').popover();
$('body').on('focus', '.poptag', function () {
    generatePopover(this);
});
$('body').on('click', function (e) {
    let popover = $('.popover')[0];
    let poptagParent = $(e.target).parents('.poptag-click')[0];

    if (!poptagParent && popover) {
        if (!$.contains(popover, e.target)) {
            $(`.poptag-click[aria-describedby='${popover.id}']`).popover('hide');
        }
    }
    else if (poptagParent)
        generatePopover(poptagParent, true);
});
