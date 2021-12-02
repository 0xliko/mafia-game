$('.win-icon').tooltip();
$('.recordedState').click(function () {
    var state = $(this).data('state');
    $('#recordModal .modal-header').text($(this).text());
    $('.modalState').hide();
    $(`.modalState[data-state=${state}]`).show();
});
