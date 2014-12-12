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
        onStreamSubscribed: function (that, streamEvent) {
            var stream = streamEvent.stream;

            if (that.isBroadcasterStream(stream)) {
                that.playButton.button('reset');
                that.remoteStreamState = 'subscribed';

                if (that.remoteStreamPopup) {
                    that.showRemoteStream(stream);
                } else {
                    that.room.unsubscribe(stream);
                }
            }
        },
        onStreamUnsubscribed: function (that, streamEvent) {
            if (that.isBroadcasterStream(streamEvent.stream)) {
                that.remoteStreamState = 'added';
            }
        },
        onStreamRemoved: function (that, streamEvent) {
            var stream = streamEvent.stream;
            if (that.isBroadcasterStream(stream)) {
                that.hideRemoteStream(stream);
                that.remoteStreamState = undefined;
            }
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

    // Can be undefined, 'added' or 'subscribed'
    Participant.prototype.remoteStreamState = undefined;

    // Remote stream popup window object
    Participant.prototype.remoteStreamPopup = undefined;

    // DOM events initialization
    Participant.prototype.initialize = function () {
        var that = this;

        that.playButton = $('#js-play-remote-button');

        that.playButton.click(function () {
            that.createPopup();
            that.room.subscribe(that.remoteStream);
            that.playButton.button('loading');
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
            case 'broadcaster':
                that.remoteStream = stream;
                if (that.remoteStreamPopup) {
                    that.room.subscribe(that.remoteStream);
                } else {
                    that.playButton.prop('disabled', false);
                }
                break;
        }
    };

    Participant.prototype.createPopup = function () {
        this.remoteStreamPopup = window.open(undefined, undefined, 'width=1280,height=720');
        this.remoteStreamPopup.document.write("<title>" + config.participant.monitorPopupTitle + "</title>");
        this.remoteStreamPopup.document.write("<body style='background: #777; margin: 0;'></body>");
        this.bindPopupEvents();
    };

    Participant.prototype.bindPopupEvents = function () {
        var that = this;

        $(that.remoteStreamPopup).unload(function () {
            that.remoteStream.stop('js-remote-video');

            if (that.remoteStreamState !== undefined) {
                that.playButton.prop('disabled', false);
            }

            if (that.remoteStreamState == 'subscribed') {
                that.room.unsubscribe(that.remoteStream);
                that.remoteStreamState = 'added';
            }
            that.remoteStreamPopup = undefined;
        });
    };

    Participant.prototype.showRemoteStream = function (stream) {
        this.disablePlayButton();

        stream.play('js-remote-video');
        $('#js-remote-video video').get(0).volume = 0.0;

        var remoteVideoHTML = $('#js-remote-video').html();
        this.remoteStreamPopup.document.body.innerHTML = remoteVideoHTML;
    };

    Participant.prototype.hideRemoteStream = function (stream) {
        this.playButton.button('reset');
        this.disablePlayButton();
        stream.stop('js-remote-video');
    };

    Participant.prototype.disablePlayButton = function () {
        var that = this;

        window.setTimeout(function() {
            that.playButton.prop('disabled', true);
        }, 0);
    };

    Participant.prototype.isBroadcasterStream = function (stream) {
        return stream.getAttributes().role == 'broadcaster';
    };

    var participant = new Participant({
        maxVideoBW: config.participant.maxVideoBW
    }, licodeHandlers);

    return participant;
})(jQuery, window.config, window.BaseBroadcaster);
