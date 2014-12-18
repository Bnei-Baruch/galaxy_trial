/*jshint curly:true, indent:4, strict:true*/

(function($, config, BaseBroadcaster) {
    "use strict";

    // Inheriting from base broadcaster
    var Broadcaster = BaseBroadcaster;

    var licodeHandlers = {
        onCameraAccessAccepted: function (that) {
            $('#js-local-video').html('');
            that.streamToBroadcast.play('js-local-video');
        }
    };

    Broadcaster.prototype.createStreamToBroadcast = function () {
        var width = config.broadcaster.videoWidth;
        var height = config.broadcaster.videoHeight;

        var videoOpt = {
            mandatory: {
                minWidth: width,
                minHeight: height,
                maxWidth: width,
                maxHeight: height,
                minAspectRatio: width / height,
                maxAspectRatio: width / height
            }
        };

        var stream = Erizo.Stream({
            audio: true,
            video: videoOpt,
            attributes: {role: 'broadcaster'},
            videoSize: config.broadcaster.videoSize
        }); 
        return stream;
    };

    var broadcaster = new Broadcaster({
        maxVideoBW: config.broadcaster.maxVideoBW
    }, licodeHandlers);
})(jQuery, window.config, window.BaseBroadcaster);
