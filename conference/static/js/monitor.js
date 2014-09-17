/*jshint curly:true, indent:4, strict:true*/

(function($, monitor) {
    "use strict";

    var bufferList;
    var currBuffer;
    var backBuffer;

    $(document).ready(function(){
        currBuffer = $('#buffer1');
        backBuffer = $('#buffer2');
        bufferList = [currBuffer, backBuffer];
        backBuffer.css('opacity', '0');
    });

    monitor.loadPreview = function (html, resizeFunc) {
        backBuffer.html(html);     
        $('.vid', backBuffer).each(function(index) {        
            var videoElement = $(this);
            var labelElement = $('label', videoElement);
            resizeFunc(videoElement, labelElement);
            $(window).resize(function() {
                resizeFunc(videoElement, labelElement);
            });
        });
    };

    monitor.showPreview = function () {
        backBuffer.css('opacity', '1');
        currBuffer.css('opacity', '0');
        currBuffer = getNextBuffer(currBuffer);
        backBuffer = getNextBuffer(backBuffer);
    };

    function getNextBuffer(buffer) {
        return (buffer == bufferList[0] ? bufferList[1] : bufferList[0]);
    }
})(jQuery, window.monitor = {});
