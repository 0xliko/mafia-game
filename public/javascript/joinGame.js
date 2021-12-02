function renderGamePage (type,status,page) {
    var loadWheel = setTimeout(() => {$('.game-item-list').html('<div class="loading-wheel-white"></div>')}, 500);

    $.get('/game/list', {list: type, status:status, page: page}, function (data) {
        var games = data.games;
        var pages = data.pages;
        clearTimeout(loadWheel);
        console.log(data)
        if (games.length)
            $('.game-item-list').html(``);
        else
            $('.game-item-list').html(`<div class='game-item-row no-yet'>No games. That's weird... Try resetting your cache</div>`);

        for (var game of games) {
            var gameRow = $(`<div class='game-item-row'></div>`);
            var type = $('.btn-sel').data('type');
            var setup = game.setup;
            var setupDivContainer = $(`<div class="people-info">
                         <div class='setup'></div>
                    </div>`);
            var setupDiv = setupDivContainer.find(".setup");
            var roles = JSON.parse(setup.roles);
            formatSetup(setupDiv, roles, setup.closed, setup.count, true);
            gameRow.append(setupDivContainer);

            if ( game.status)
                gameRow.append(`<div class='player-count'><label>Players</label><div>${game.players} / ${setup.total}</div></div>`);
            else if (loggedIn) {
                /*gameRow.append(`<div class='player-count'><button class='btn-rehost btn btn-primary' data-setup='${setup.id}' data-ranked='${game.ranked}' data-statelengths='${JSON.stringify({day: game.stateLengths.day / 60000, night: game.stateLengths.night / 60000})}'>Rehost</button></div>`);*/
                gameRow.append(`<div class='player-count'></div>`);
            }
            else
                gameRow.append(``);

            gameRow.append(`<div class="ranked-status"><label>Ranked</label><input type="radio" name="ranked" disabled/></div><div class="staked-status"><label>Staked</label><input type="radio" name="staked" disabled/></div>`);
            $('.game-item-list').append(gameRow);
            if (loggedIn) {
                if (game.status == 'open') {
                    if (game.players < setup.total)
                        gameRow.append(`<div class="btn-container"><button class='btn btn-success btn-location' data-href='/game/${game.id}'>Connect</button></div>`);
                    else
                        gameRow.append(`<div class="btn-container"><button class='btn btn-success btn-location' disabled>Starting</button></div>`);
                }
                else if (game.status == 'progress')
                    gameRow.append(`<div class="btn-container"><button class='btn btn-success btn-progress' disabled>In Progress</button></div>`);
                else {
                    //gameRow.append(`<div class="btn-container"><button class='btn btn-success btn-location review' data-href='/game/${game.id}/review'>Review</button></div>`);
                    gameRow.append(`<div class="btn-container"></div>`);
                }
            }

            if(status == 'active'){
                const oldHtml = `<i tabindex='0' class='game-info fas fa-info-circle poptag' data-toggle='popover' data-trigger='focus' data-type='game' data-id='${game.id}' title='Game ${game.id}' data-content='pop-${game.id}'></i>`
                gameRow.append(`<i></i>`);
            }

        }

        if(status =='active')
            $('.pagination-wrapper').hide();
        else {
            $('.pagination-wrapper').show();
            pagination($('.pagination-wrapper'), pages, page);
        }
        // $('.pofptag').popover();
    });
}

$('.game-list-btn').click(function () {
    $('.game-list-btn').removeClass('btn-sel');
    $(this).addClass('btn-sel');
    renderGamePage($('.btn-sel').data('type'), $('.game-status-toggle.active').data('status'),1);
});

$('.ant-switch').click(function(){
    $(this).toggleClass("ant-switch-checked");
    const $animationItem = $("div",this);

    $animationItem.addClass("ant-click-animating-node");
    setTimeout(()=>{
        $animationItem.removeClass("ant-click-animating-node");
    },500)


})
$('.refresh-games').click(function () {
    renderGamePage($('.btn-sel').data('type'), $('.game-status-toggle.active').data('status') ,$('.page-sel').text() || 1);
});

$('body').on('click', '.page-item', function () {
    if (!$(this).hasClass('disabled'))
        renderGamePage($('.btn-sel').data('type'),$('.game-status-toggle.active').data('status'), $(this).data('page'));
});

$('body').on('click', '.btn-location', function () {
    window.location = $(this).data('href');
});

$('body').on('click', '.btn-rehost', function () {
    $.post('/game/create', {
        setup: $(this).data('setup'),
        stateLengths: $(this).data('statelengths'),
        ranked: Boolean($(this).data('ranked')) ? true : ''
    }, function (res) {
        if (res.error)
            showError(res.error);
        else
            window.location = `/game/${res.game}`;
    });
});
$(".game-status-toggle").click(function(){
    $(".game-status-toggle").removeClass("active");
    $(this).addClass("active")
    renderGamePage($('.btn-sel').data('type'), $('.game-status-toggle.active').data('status') ,$('.page-sel').text() || 1);
})
$(`.game-list-btn[data-type='normal']`).click();
