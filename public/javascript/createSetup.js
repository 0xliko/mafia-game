var alignment;
var roleset = 0;

function showRoles (align) {
    $('.role-cell').hide();
    $(`.role-cell[data-alignment='${align}']`).css('display', 'flex');
    alignment = align;
}

function renderRoleSelection (roleset) {
    roleset = roleset || $('.roleset-sel');
    var index = roleset.data('index');
    var html = index == 0 ? '<div class="setup"></div>' : '<div class="setup"></div><i class="delete-roleset fas fa-times-circle i-red setup-open"></i>';
    roleset.html(html);

    var displayRoles;
    if ($('.closed-roles').prop('checked')) {
        var temp = roles.village.concat(roles.mafia).concat(roles.monsters).concat(roles.independent);
        displayRoles = temp.reduce((obj, roleName) => {
            obj[roleName] = 1;
            return obj;
        }, {});
    }
    else
        displayRoles = roles[index];

    formatSetup(roleset.find('.setup'), [displayRoles], false, null, true, false, true);
}

$('.role-btn').click(function () {
    $('.role-btn').removeClass('btn-sel');
    $(this).addClass('btn-sel');
    showRoles($(this).data('alignment'));
});

$('.role-search input').keyup(function () {
    var query = $(this).val().toLowerCase();

    if (query.length) {
        $('.role-btn').removeClass('btn-sel');
        $('.role-cell').hide();
        $('.role-cell').each(function () {
            if ($(this).find('.role-name').text().toLowerCase().indexOf(query) != -1)
                $(this).css('display', 'flex');
        });
    }
    else
        $(`.role-btn[data-alignment='village']`).click();
});

$('.add-role').click(function () {
    var roleName = $(this).parent().data('role');

    if (!$('.closed-roles').prop('checked')) { //open roles
        var index = $('.roleset-sel').data('index');

        if (!roles[index])
            roles[index] = {};

        var roleset = roles[index];

        if (!roleset[roleName])
            roleset[roleName] = 0;

        roleset[roleName]++;
    }
    else { //closed roles
        var alignment = $(this).parent().data('alignment');

        if (roles[alignment].indexOf(roleName) == -1)
            roles[alignment].push(roleName);
    }

    renderRoleSelection();
});

$('.check-wrap .check-icon').click(function () {
    if ($(this).parent().hasClass('closed-check')) {
        if ($(this).parent().find('.checkbox').prop('checked')) {
            $('.roleset-list').html(`<div class='roleset roleset-sel' data-index='0'><div class='setup'></div></div>`);
            $('.setup-open').hide();
            $('.setup-closed').css('display', 'flex');
            roles = {village: [], mafia: [], monsters: [], independent: []};
        }
        else {
            $('.setup-closed').hide();
            $('.setup-open').css('display', 'flex');
            roles = [];
        }
        renderRoleSelection();
    }
    else if ($(this).parent().hasClass('whispers-check')) {
        if ($(this).parent().find('.checkbox').prop('checked'))
            $('.setup-whispers').css('display', 'flex');
        else
            $('.setup-whispers').hide();
    }
});

$(`input[type='number']`).change(function () {
    if (Number($(this).val()) < Number($(this).attr('min')) || Number($(this).val()) > Number($(this).attr('max'))) {
        $(this).val($(this).data('last-val'));
    }
    else
        $(this).data('last-val', $(this).val());
});

$('body').on('click', '.roleset', function () {
    $('.roleset').removeClass('roleset-sel');
    $(this).addClass('roleset-sel');
});

$('.add-roleset').click(function () {
    if ($('.roleset').length < 10) {
        $('.roleset').removeClass('roleset-sel');
        let roleset = `<div class='roleset roleset-sel' data-index='${$('.roleset').length}'><div class='setup'></div><i class="delete-roleset fas fa-times-circle i-red setup-open"></i></div>`;
        $('.roleset-list').append(roleset);
    }

});

$('body').on('mouseup', '.delete-roleset', function () {
    var parent = $(this).parent();
    var index = Number(parent.data('index'));

    roles.splice(index, 1);

    $('.roleset').each(function () {
        var oldIndex = Number($(this).data('index'));
        if (oldIndex > index)
            $(this).data('index', oldIndex - 1);
    });

    $(this).parent().remove();
    $('.roleset').removeClass('roleset-sel');
    $('.roleset').first().addClass('roleset-sel');
});

$('body').on('click', '.roleset .role', function () {
    var roleName = $(this).data('role');
    var roleset = $(this).parent().parent().parent();

    if ($('.closed-roles').prop('checked')) { //Closed roles
        for (var alignment in roles) {
            var index = roles[alignment].indexOf(roleName);
            if (index != -1) {
                roles[alignment].splice(index, 1);
                break;
            }
        }
    }
    else { //Open roles
        var index = roleset.data('index');
        roles[index][roleName]--;

        if (roles[index][roleName] < 1)
            delete roles[index][roleName];
    }

    renderRoleSelection(roleset);
});

$('.create-setup-btn').click(function () {
    $(this).html('<div class="loading-wheel"></div>');
    $(this).attr('disabled', true);

    let setup = $('.setup-edit').val();
    let editing = setup ? true : false;
    $.post(
        '/setup/create',
        {
            edit: editing ? true : '',
            id: editing ? setup : '',
            name: $('.setup-name').val(),
            closed: $('.closed-roles').prop('checked') ? true : '',
            unique: $('.unique-roles').prop('checked') ? true : '',
            roles: roles,
            count: !$('.closed-roles').prop('checked') ? {} : {
                village: $('.village-count').val(),
                mafia: $('.mafia-count').val(),
                monsters: $('.monsters-count').val(),
                independent: $('.independent-count').val()
            },
            startState: $('.day-start').prop('checked') ? 'day' : 'night',
            whispers: $('.whispers').prop('checked') ? true : '',
            leakPercentage: $('.whispers-leak').val(),
            lastWill: $('.last-will').prop('checked') ? true : '',
            mustAct: $('.must-act').prop('checked') ? true : '',
            noReveal: $('.no-reveal').prop('checked') ? true : ''
        },
        function (res) {
            $('.create-setup-btn').attr('disabled', false);

            if (res.error) {
                showError(res.error);

                if (editing)
                    $('.create-setup-btn').html('Edit');
                else
                    $('.create-setup-btn').html('Create');
            }
            else {
                if (editing) {
                    showSuccess(`Setup edited. <a href='/game/host?id=${res.id}'>Host it</a>`, true);
                    $('.setup-edit').val('');
                    $('.setup-h1').text('Create Setup');
                }
                else
                    showSuccess(`Setup created. <a href='/game/host?id=${res.id}'>Host it</a>`, true);

                $('.create-setup-btn').text('Create');
                $('.setup-name').val('');
                roles = $('.closed-roles').prop('checked') ? {village: [], mafia: [], monsters: [], independent: []} : [];
                renderRoleSelection();
            }
        }
    );
});

showRoles('village');

if ($('.whispers').prop('checked'))
    $('.setup-whispers').css('display', 'flex');

if (Array.isArray(roles)) {
    $('.setup-open').css('display', 'flex');

    for (let i = 1; i < roles.length; i++) {
        let roleset = $(`<div class='roleset' data-index='${$('.roleset').length}'><div class='setup'></div><i class="delete-roleset fas fa-times-circle i-red setup-open"></i></div>`);
        $('.roleset-list').append(roleset);
        renderRoleSelection(roleset);
    }
}
else {
    $('.setup-closed').css('display', 'flex');
}

renderRoleSelection();
