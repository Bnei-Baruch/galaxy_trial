/*jshint curly:true, indent:4, strict:true*/

require(
    ['jquery', 'config', 'base-broadcaster'],
    function($, config, BaseBroadcaster) {
        "use strict";

        // Inheriting from base broadcaster
        var Broadcaster = BaseBroadcaster;

        var licodeHandlers = {
            onCameraAccessAccepted: function (that) {
                that.streamToBroadcast.play('js-local-video');
            }
        };

        Broadcaster.prototype.createStreamToBroadcast = function () {
            var stream = Erizo.Stream({
                audio: true,
                video: true,
                attributes: {role: 'broadcaster'},
                videoSize: config.broadcaster.videoSize
            }); 
            return stream;
        };

        var broadcaster = new Broadcaster({
            maxVideoBW: config.broadcaster.maxVideoBW
        }, licodeHandlers);
    });
