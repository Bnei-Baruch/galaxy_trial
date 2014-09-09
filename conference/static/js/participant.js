/*jshint curly:true, indent:4, strict:true*/

/* TODO: I18N, convert to CoffeScript in order to get rid of the ugly JS inheritances */

require(
    ['jquery', 'config', 'base-broadcaster'],
    function($, config, BaseBroadcaster) {
        "use strict";

        var Participant = function () {};

        Participant.prototype.handlers = {
            onCameraAccessAccepted: function () {
                var localStream = Erizo.Stream({
                    stream: streamToBroadcast.stream.clone(),
                    video: true,
                });

                localStream.show('js-local-video', {speaker: false});
            },
            onRoomConnected: function (roomEvent) {
                this.broadcastedVideoTrack = this.streamToBroadcast.stream.getVideoTracks()[0];
                this.broadcastedVideoTrack.enabled = false;
            },
            onStreamSubscribed: function (streamEvent) {
                var stream = streamEvent.stream;

                if (this.isBroadcasterStream(stream)) {
                    playButton.button('reset');
                    this.remoteStreamState = 'subscribed';

                    if (remoteStreamPopup) {
                        this.showRemoteStream(stream);
                    } else {
                        this.room.unsubscribe(stream);
                    }
                }
            },
            onStreamUnsubscribed: function (streamEvent) {
                if (_isBroadcasterStream(streamEvent.stream)) {
                    this.remoteStreamState = 'added';
                }
            },
            onStreamRemoved: function (streamEvent) {
                var stream = streamEvent.stream;
                if (this.isBroadcasterStream(stream)) {
                    this.hideRemoteStream(stream);
                    this.remoteStreamState = undefined;
                }
            },

            onDataStreamMessage: function(e) {
                console.log("Got message: ", e.msg);
                // Holds or unhold broadcaster stream
                if (e.msg.participantID == this.nuveConfig.userId) {
                    broadcastedVideoTrack.enabled = (e.msg.action == 'unhold');
                }
            }
        };

        Participant.prototype.initialize = function () {
            var that = this;

            that.playButton = $('#js-play-remote-button');

            that.playButton.click(function () {
                that.createPopup();
                that.room.subscribe(remoteStream);
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
            switch (role) {
                case 'initiator':
                    this.room.subscribe(stream);
                    stream.addEventListener('stream-data', onDataStreamMessage);
                    break;
                case 'broadcaster':
                    remoteStream = stream;
                    if (this.remoteStreamPopup) {
                        this.room.subscribe(remoteStream);
                    } else {
                        this.playButton.prop('disabled', false);
                    }
                    break;
            }
        };

        Participant.prototype.createPopup = function () {
            this.remoteStreamPopup = window.open(undefined, undefined, 'width=1024,height=768');
            this.remoteStreamPopup.document.write("<title>" + config.participant.monitorPopupTitle + "</title>");
            this.remoteStreamPopup.document.write("<body style='background: #777; margin: 0; cursor: none;'></body>");
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
                    that.room.unsubscribe(remoteStream);
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

        // Inheriting from base broadcaster class
        $.extend(Participant.prototype, BaseBroadcaster.prototype);

        var participant = new Participant({
            maxVideoBW: config.participant.maxVideoBW
        });
    });
