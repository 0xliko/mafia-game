let redirect = localStorage.cryptomafiaRedirect;
if (redirect) {
    delete localStorage.cryptomafiaRedirect;
    window.location = redirect;
}

$.fn.popover.Constructor.prototype.reposition = function () {
    var $tip = this.tip()
    var autoPlace = true

    var placement = typeof this.options.placement === 'function' ? this.options.placement.call(this, $tip[0], this.$element[0]) : this.options.placement

    var pos = this.getPosition()
    var actualWidth = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (autoPlace) {
        var orgPlacement = placement
        var viewportDim = this.getPosition(this.$viewport)

        placement = placement === 'bottom' &&
            pos.bottom + actualHeight > viewportDim.bottom ? 'top' : placement === 'top' &&
            pos.top - actualHeight < viewportDim.top ? 'bottom' : placement === 'right' &&
            pos.right + actualWidth > viewportDim.width ? 'left' : placement === 'left' &&
            pos.left - actualWidth < viewportDim.left ? 'right' : placement

        $tip
            .removeClass(orgPlacement)
            .addClass(placement)
    }

    var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

    this.applyPlacement(calculatedOffset, placement)
}

$('body').click(function () {
    $('.tooltip').remove();
});

$('a.leave').click(function () {
    $.post('/game/leave', function () {
        window.location.reload();
    });
});

$.get('/nextRestart', function (minutes) {
    minutes = Number(minutes);
    if (minutes > -1)
        showNotif(`The server will be restarting in ${minutes} minute${minutes != 1 ? 's' : ''}`);
});

(function(){

     window.fetchNFTS  = function(data) {
         function renderImages(response) {

             $("#pickNFTModal .modal-body").html('');
             if (response.nfts && response.nfts.length) {
                 response.nfts.forEach((nft) => {
                     $("#pickNFTModal .modal-body").append(`<a> <img alt="${nft.arweave_metadata}" src="${nft.arweave_metadata}"></img> <label>${nft.token_metadata.tokenInfo.name}</label></a>`);

                 })
             } else {
                 $("#pickNFTModal .modal-body").html('Please buy any nft image for your profile');
             }
         }

         $.get(`https://cryptomafia-api-nft-viewer-owivntwoka-uk.a.run.app/fetch_nft_data?address=${data.address}`)
             .done(function (res) {
                 if (res.length || (res.nfts && res.nfts.length))
                     renderImages(res);
                 else {
                     $.get(`https://cryptomafia-api-nft-viewer-owivntwoka-uk.a.run.app/fetch_nft_data?address=${data.address}`)
                         .done(function (res) {
                             renderImages(res)
                         }).fail(function (err) {

                     })
                 }

             }).fail(function (err) {
             $.get(`https://cryptomafia-api-nft-viewer-owivntwoka-uk.a.run.app/fetch_nft_data?address=${data.address}`)
                 .done(function (res) {
                     renderImages(res)
                 }).fail(function (err) {

             })
         });
         $("#pickNFTModal .modal-body").html('Your NFT images will be here');
         $("#pickNFTModal").modal();
     }
     $("#pickNFTModal .modal-body").on('click',"a",function(){
        const imgUrl = $("img",this).attr('src');
        localStorage.setItem("profileImg",imgUrl);
        $("#pickNFTModal").modal('hide');
        $.post('/user/profileImgUpdate', {
            imgUrl:imgUrl
        }, function (res) {
            if(!res.success){
                $.toast(`${res.error} <a class='
            toast-action close'>&times;</a>` , 3000, function () { });
            }
            if(!res.success){
                $.toast(`${res.error} <a class='
            toast-action close'>&times;</a>` , 3000, function () { });
            }
        });
    })
})();


