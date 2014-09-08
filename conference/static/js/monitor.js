/*jshint curly:true, indent:4, strict:true*/

function showPreview(html, resizeFunc) {
    $('#monitor').html(html);

    $('.vid').each(function(index) {
        var videoId = $(this)[0].id;
        var labelElement = $('#' + videoId + ' label');
        var videoElement = $(this);
        resizeFunc(videoElement, labelElement);
        $(window).resize(function() {
            resizeFunc(videoElement, labelElement);
        });
    });
}

