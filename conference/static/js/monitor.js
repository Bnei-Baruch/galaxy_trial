var bufferList;
var curBuffer;
var backBuffer;

$(document).ready(function(){
	curBuffer = $('#buffer1');
	backBuffer = $('#buffer2');
	bufferList = [curBuffer, backBuffer];
    backBuffer.css('opacity', '0');
});

function loadPreview(html, resizeFunc) {
    backBuffer.html(html);     
    $('.vid', backBuffer).each(function(index) {        
        var videoElement = $(this);
        var labelElement = $('label', videoElement);
        resizeFunc(videoElement, labelElement);
        $(window).resize(function() {
            resizeFunc(videoElement, labelElement);
        });
    });
}

function showPreview()
{
    backBuffer.css('opacity', '1');
    curBuffer.css('opacity', '0');
    curBuffer = getNextBuffer(curBuffer);
    backBuffer = getNextBuffer(backBuffer);
}


function getNextBuffer(buffer) {
    return (buffer == bufferList[0] ? bufferList[1] : bufferList[0]);
}
