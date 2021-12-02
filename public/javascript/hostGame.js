var selectedSetup = $('.game-setup-id').val();

function renderSetups (type, page, query) {
    var loadWheel = setTimeout(() => {$('.setup-list').html('<div class="loading-wheel-white"></div>')}, 500);
    $.get(`/setup/${type}`, {page: page, query: query}, function (res) {
        let setups = res.setups;
        clearTimeout(loadWheel);

        if (setups.length)
            $('.setup-list').html('');
        else
            $('.setup-list').html('<div class="none-yet">No setups found</div>');

        for (var setup of setups) {
            var setupCell = $(`
                <div class='setup-cell' data-id='${setup.id}' data-name='${inSingleQuotedAttr(setup.name)}'>
                    ${loggedIn ? `<i class='${selectedSetup == setup.id ? 'fas' : 'far'} fa-circle i-green select-setup' title='Select Setup'></i>` : ''}
                    <div tabindex='0' class='setup poptag' data-toggle='popover' data-trigger='focus' data-type='setup' data-id='${setup.id}' title='${inSingleQuotedAttr(setup.name)}' data-content='pop-${setup.id}'></div>
                    ${loggedIn ? `<i class='${favorites.indexOf(setup.id) != -1 ? 'fas' : 'far'} fa-star i-yellow fav-setup' title='Favorite Setup'></i>` : ''}
                </div>
            `);
            var roles = JSON.parse(setup.roles);
            formatSetup(setupCell.find('.setup'), roles, setup.closed, setup.count, true);

            if (type == 'created') {
                setupCell.append(`<i class='edit-setup i-blue fas fa-pen-square' title='Edit Setup'></i>`);
                setupCell.append(`<i class='delete-setup i-red fas fa-times-circle' title='Disconnect Setup'></i>`);
            }

            $('.setup-list').append(setupCell);
        }

        if (type == 'id')
            $('.select-setup').click();

        // $('.poptag').popover();
        pagination($('.pagination-wrapper'), res.pages, page);
    });
}

$('.setup-btn').click(function () {
    $('.setup-btn').removeClass('btn-sel');
    $(this).addClass('btn-sel');
    renderSetups($(this).data('path'), 1);
});

$('.setup-search input').keyup(function () {
    var query = $(this).val().toLowerCase();

    if (query.length) {
        $('.setup-btn').removeClass('btn-sel');
        renderSetups('search', 1, query);
    }
    else
        $(`.setup-btn[data-path='featured']`).click();
});

$('body').on('click', '.select-setup', function () {
    $('.select-setup').removeClass('fas');
    $('.select-setup').addClass('far');
    $(this).addClass('fas');
    $(this).removeClass('far');

    selectedSetup = $(this).parent().data('id');
    $('.game-setup-id').val(selectedSetup);
    $('.game-setup').val($(this).parent().data('name'));
});

$('body').on('click', '.fav-setup', function () {
    if ($(this).hasClass('far')) { //Not favorited yet
        $(this).addClass('fas');
        $(this).removeClass('far');

        var id = $(this).parent().data('id');
        $.post('/setup/favorite', {id: id});
        favorites.push(id);
    }
    else { //Already favorited
        $(this).addClass('far');
        $(this).removeClass('fas');

        var id = $(this).parent().data('id');
        $.post('/setup/favorite', {id: id});
        favorites.splice(favorites.indexOf(id), 1);
    }
});

$('body').on('click', '.edit-setup', function () {
    window.location = `/roles?edit=${$(this).parent().data('id')}`;
});

$('body').on('click', '.delete-setup', function () {
    $.post('/setup/delete', {id: $(this).parent().data('id')}, (res) => {
        if (!res.error)
            $(this).parent().remove();
        else
            showError(res.error);
    });
});

$('.ranked').change(function () {
    if ($(this).val() == 'yes') {
        $('.setup-btn').attr('disabled', true);
        $(`.setup-btn[data-path='featured']`).attr('disabled', false);
        $(`.setup-btn[data-path='featured']`).click();
    }
    else
        $('.setup-btn').attr('disabled', false);
});

$(`input[type='number']`).change(function () {
    if (Number($(this).val()) < Number($(this).attr('min')) || Number($(this).val()) > Number($(this).attr('max'))) {
        $(this).val($(this).data('last-val'));
    }
    else
        $(this).data('last-val', $(this).val());
});

$('.create-game').submit(function (e) {
    e.preventDefault();
});

$('.create-game-btn').click(function (e) {
    $(this).html('<div class="loading-wheel"></div>');
    $(this).attr('disabled', true);

    $.post('/game/create', {
        setup: $('.game-setup-id').val(),
        stateLengths: {
            day: $('.day-length').val(),
            night: $('.night-length').val()
        },
        ranked: $('.ranked').val() == 'yes' ? true : '',
        private: $('.private').val() == 'yes' ? true : '',
    },
    res => {
        if (res.error) {
            showError(res.error);
            $(this).html('Host');
            $(this).attr('disabled', false);
        }
        else
            window.location = `/game/${res.game}`;
    });
});

$('body').on('click', '.page-item', function () {
    if (!$(this).hasClass('disabled'))
        renderSetups($('.btn-sel').data('path') || 'search', $(this).data('page'), $('.setup-search input').val());
});

if (!window.location.search)
    $(`.setup-btn[data-path='featured']`).click();
else {
    $('.setup-btn').removeClass('btn-sel');
    renderSetups('id', 0, window.location.search.replace('?id=', ''));
}
