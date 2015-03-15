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

        // videoOpt doesnt work with Licode 1.1 for some reason, so replaced with videoSize
        var stream = Erizo.Stream({
            audio: true,
            video: true,
            attributes: {role: 'broadcaster'},
            videoSize: [width, height, width, height]
        }); 
        return stream;
    };

    var broadcaster = new Broadcaster({
        maxVideoBW: config.broadcaster.maxVideoBW
    }, licodeHandlers);
})(jQuery, window.config, window.BaseBroadcaster);
