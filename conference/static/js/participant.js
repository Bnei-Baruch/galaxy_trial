/*jshint curly:true, indent:4, strict:true*/

/* TODO: Integrate into the AngularJS app */

(function($, config, BaseBroadcaster) {
    "use strict";

    // Inheriting from base broadcaster
    var Participant = BaseBroadcaster;

    var licodeHandlers = {
        onCameraAccessAccepted: function (that) {
            var localStream = Erizo.Stream({
                stream: that.streamToBroadcast.stream.clone(),
                video: true,
            });

            localStream.show('js-local-video', {speaker: false});
        },
        onRoomConnected: function (that, roomEvent) {
            that.broadcastedVideoTrack = that.streamToBroadcast.stream.getVideoTracks()[0];
            that.broadcastedVideoTrack.enabled = false;
        },
        onDataStreamMessage: function(that, e) {
            console.log("Got message: ", e.msg);
            // Holds or unhold broadcaster stream
            if (e.msg.participantID == that.nuveConfig.userId) {
                that.broadcastedVideoTrack.enabled = (e.msg.action == 'unhold');
            }
        }
    };

    // WebRTC track object for the local stream
    Participant.prototype.broadcastedVideoTrack = undefined;

    // Remote stream popup window object
    Participant.prototype.remoteStreamPopup = undefined;

    // DOM events initialization
    Participant.prototype.initialize = function () {
        var that = this;

        that.playButton = $('#js-play-remote-button');

        that.playButton.click(function () {
            if (!that.remoteStreamPopup) {
                that.createPopup();
            }
        });

        $(window).unload(function () {
            if (that.remoteStreamPopup) {
                that.remoteStreamPopup.close();
            }
        });
    };

    Participant.prototype.createStreamToBroadcast = function () {
        var stream = Erizo.Stream({
            audio: false,
            video: true,
            data: false,
            attributes: {participantID: this.nuveConfig.userId, role: 'participant'},
            videoSize: config.participant.videoSize
        }); 
        return stream;
    };

    Participant.prototype.processNewStream = function (stream, role) {
        var that = this;

        switch (role) {
            case 'initiator':
                that.room.subscribe(stream);
                stream.addEventListener('stream-data', function (e) {
                    licodeHandlers.onDataStreamMessage(that, e);
                });
                break;
        }
    };

    Participant.prototype.createPopup = function () {
        this.remoteStreamPopup = window.open(config.participant.playerPopupUrl, undefined, 'width=1280,height=720');
        this.bindPopupEvents();
    };

    Participant.prototype.bindPopupEvents = function () {
        var that = this;

        $(that.remoteStreamPopup).unload(function (e) {
            if (that.remoteStreamPopup.location.href !== 'about:blank') {
                that.remoteStreamPopup = undefined;
            }
        });
    };

    var participant = new Participant({
        maxVideoBW: config.participant.maxVideoBW
    }, licodeHandlers);

    return participant;
})(jQuery, window.config, window.BaseBroadcaster);
