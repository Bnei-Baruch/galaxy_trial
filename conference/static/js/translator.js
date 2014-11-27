/*jshint curly:true, indent:4, strict:true*/

(function($, config, BaseBroadcaster) {
    "use strict";

    // Inheriting from base broadcaster
    var Translator = BaseBroadcaster;

    var licodeHandlers = {
        onRoomConnected: function (that) {
            that.muteButton.prop('disabled', false);
        },
        onStreamSubscribed: function(that, streamEvent) {
            streamEvent.stream.play('js-local-video');
        }
    };

    Translator.prototype.createStreamToBroadcast = function () {
        var stream = Erizo.Stream({
            audio: true,
            video: false,
            attributes: {
                role: 'translator',
                language: this.nuveConfig.language
            },
        }); 
        return stream;
    };

    Translator.prototype.processNewStream = function (stream, role) {
        if (role == 'broadcaster') {
            this.room.subscribe(stream);
        }
    };

    Translator.prototype.initialize = function () {
        var that = this;

        that.muteButton = $('#js-mute-button');

        that.muteButton.click(function () {
            var muted = !$(this).hasClass('active');
            that.streamToBroadcast.stream.getAudioTracks()[0].enabled = !muted;
            $(this).text(muted ? "Unmute" : "Mute");
        });
    };

    var broadcaster = new Translator({}, licodeHandlers);
})(jQuery, window.config, window.BaseBroadcaster);
