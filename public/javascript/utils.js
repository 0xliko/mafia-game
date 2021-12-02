var inHTMLData = xssFilters.inHTMLData;
var inHTMLComment = xssFilters.inHTMLComment;
var inSingleQuotedAttr = xssFilters.inSingleQuotedAttr;
var inDoubleQuotedAttr = xssFilters.inDoubleQuotedAttr;
var inUnQuotedAttr = xssFilters.inUnQuotedAttr;

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function capitalize (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function random (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function showError (msg, html) {
    $('.alert').hide();

    if (html)
        $('.error').html(msg).show();
    else
        $('.error').text(msg).show();

    document.body.scrollTo(0, 0);
}

function showSuccess (msg, html) {
    $('.alert').hide();

    if (html)
        $('.success').html(msg).show();
    else
        $('.success').text(msg).show();

    document.body.scrollTo(0, 0);
}

function showNotif (msg, html) {
    $('.alert').hide();

    if (html)
        $('.notif').html(msg).show();
    else
        $('.notif').text(msg).show();

    document.body.scrollTo(0, 0);
}

function avatarUrl (dId, avatar, tag) {
    if (avatar && avatar.indexOf('https://i.imgur.com/') == 0)
        return avatar;
    else if (avatar && dId && dId.length > 10)
        return `https://cdn.discordapp.com/avatars/${dId}/${avatar}.png`;
    else if (dId && dId.length == 10) {
        dId = dId.replaceAll('-', '').replaceAll('_', '');
        return `https://cdn.discordapp.com/embed/avatars/${Number(String(parseInt(dId, 36))[9]) % 5}.png`;
    }
    else if (tag != null)
        return `https://cdn.discordapp.com/embed/avatars/${Number(tag) % 5}.png`;
}

function roleName (role) {
    if (role)
        return role.split(' ').join('-');
    else
        return null;
}

function formatSetup (html, roles, closed, count, noTooltip, small, noLimit, rolePop) {
    rolePop = true
    noLimit = true
    if (closed) {
        html.append(`
            ${count.village ? `
                <div class='role-count-wrap'>
                    <i class='fas fa-question i-village' data-toggle='tooltip' title='Village'></i>
                    <div class='super'>${count.village}</div>
                </div>
            ` : ''}
            ${count.mafia ? `
                <div class='role-count-wrap'>
                   <i class='fas fa-question i-mafia' data-toggle='tooltip' title='Mafia'></i>
                    <div class='super'>${count.mafia}</div>
                </div>
            ` : ''}
            ${count.monsters ? `
                <div class='role-count-wrap'>
                    <i class='fas fa-question i-monsters' data-toggle='tooltip' title='Monsters'></i>
                    <div class='super'>${count.monsters}</div>
                </div>
            ` : ''}
            ${count.independent ? `
                <div class='role-count-wrap'>
                    <i class='fas fa-question i-independent' data-toggle='tooltip' title='Independent'></i>
                    <div class='super'>${count.independent}</div>
                </div>
            ` : ''}
        `);
    }
    else {
        if (roles.length > 1)
            html.append('<i class="multi-setup-icon fas fa-list-alt"></i>');

        let roleNames = Object.keys(roles[0] || {});
        for (var role of roleNames) {
            let index = roleNames.indexOf(role);
            if (index < 6 || noLimit) {
                html.append(`
                    <div tabindex='${index}' class='role-count-wrap ${rolePop ? 'poptag' : ''}' data-toggle='popover' data-trigger="focus" data-placement="left"  data-type='role' data-id='${role}' title='${role}' data-content='pop-${role}'>
                        <div class='${small ? 'role-small' : 'role'} role-${roleName(role)}' data-role='${role}' data-toggle='tooltip' title='${role}'></div>
                        <div class='super'>${roles[0][role]}</div>                        
                    </div>
                `);
            }
            else if (index == 6)
                html.append('<i class="fas fa-ellipsis-h"></i>');
        }
    }

    if (!noTooltip) {
        html.find('.role, .role-small, .role-count-wrap .fa-question').tooltip();
        html.css('overflow-x', 'unset');
    }

    if (rolePop) {
         html.find('.role-count-wrap').each(function(index,ele){
             $(ele).popover({container: $(".site-wrapper,.game-container") , placement: function(popover,dom,context){
                 const domPosition = $(dom)[0].getBoundingClientRect();
                 const containerPosition = $(".site-wrapper,.game-container")[0].getBoundingClientRect();
                 const offSetX =  domPosition.x + domPosition.width/2 - containerPosition.x - 34;
                 const offSetY =  domPosition.y + domPosition.height - containerPosition.y + 5;

                 $(popover).css({marginTop:offSetY,marginLeft:offSetX})
                 return 'top';
             }});
         })
    }

    return html;
}

function setupWidget (parent, setup, placement, click, rolePop) {
    var setupHtml = $(`<div tabindex='0' class='setup ${!click ? 'poptag' : 'poptag-click'}' data-rolePop='${rolePop ? true : ''}' data-toggle='popover' ${!click ? 'data-trigger="focus"' : ''} data-type='setup'  ${placement ? `data-placement='${placement}'` : ''} data-id='${setup.id}' title='${setup.name}' data-content='pop-${setup.id}'></div>`);
    this.formatSetup(setupHtml, setup.roles, setup.closed, setup.count, true);
    parent.html(setupHtml);
    // setupHtml.popover();
}

function pagination (wrapper, pageAmt, page) {
    var html = $(`
        <ul class='pagination'>
            <li class='page-item  ${page <= 1 ? 'disabled' : ''}' data-page='${1}'>
                <a class='page-link raydium-theme-button'>&laquo;</a>
            </li>
        </ul>
    `);

    let max, min;
    if (page < 3) {
        max = 5;
        min = 1;
    }
    else {
        if (page <= pageAmt - 2) {
            max = page + 2;
            min = page - 2;
        }
        else if (pageAmt > 4) {
            max = pageAmt;
            min = pageAmt - 4;
        }
        else {
            max = pageAmt;
            min = 1;
        }
    }

    for (var i = min; i <= pageAmt && i <= max; i++) {
        html.append(`
            <li class='page-item' data-page='${i}'>
                <a class='page-link raydium-theme-button ${page == i ? 'page-sel' : ''}'>${i}</a>
            </li>
        `);
    }

    html.append(`
        <li class='page-item ${page >= pageAmt ? 'disabled' : ''}' data-page='${pageAmt}'>
            <a class='page-link raydium-theme-button'>&raquo;</a>
        </li>
    `);

    wrapper.html('');
    wrapper.append(html);
    return html;
}

$('.check-icon').click(function () {
    let checkbox = $(this).parent().find('.checkbox');
    if (checkbox.prop('checked')) {
        $(this).attr('class', 'check-icon far fa-check-square');
        checkbox.prop('checked', false);
    }
    else {
        $(this).attr('class', 'check-icon fas fa-check-square');
        checkbox.prop('checked', true);
    }
});
