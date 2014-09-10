var curMonitor = '#monitor1';
var backMonitor = '#monitor2';

$(document).ready(function(){
    $(backMonitor).css('opacity', '0');
});

function loadPreview(html, resizeFunc) {
    $(backMonitor).html(html);
     
    $(backMonitor + ' .vid').each(function(index) {
        var videoId = $(this)[0].id;
        var labelElement = $('#' + videoId + ' label');
        var videoElement = $(this);
        resizeFunc(videoElement, labelElement);
        $(window).resize(function() {
            resizeFunc(videoElement, labelElement);
        });
    });
}

function showPreview()
{
    $(backMonitor).css('opacity', '1');
    $(curMonitor).css('opacity', '0');
    curMonitor = getNextMonitor(curMonitor);
    backMonitor = getNextMonitor(backMonitor);
}


function getNextMonitor(monitorId) {
    return (monitorId == '#monitor1' ? '#monitor2' : '#monitor1');
}
