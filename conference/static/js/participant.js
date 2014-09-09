/*jshint curly:true, indent:4, strict:true*/

/* TODO: I18N */

require(
    ['jquery', 'config', 'erizo', 'disable-erizo-bar'],
    function($, config) {
        "use strict";

        // Page settings taken from DOM
        var settings;

        // Erizo room object
        var room;

        // Licode event handlers
        var handlers;

        // Erizo streams
        var streamToBroadcast, remoteStream;

        // WebRTC track object for the local stream
        var broadcastedVideoTrack;

        // DOM objects
        var remoteStreamPopup, playButton;

        // Can be undefined, 'added' or 'subscribed'
        var remoteStreamState;


        $(function () {
            settings = $('#js-settings').data();

            streamToBroadcast = createStreamToBroadcast();

            initErizoRoom();
            bindDOMEvents();

            streamToBroadcast.init();
        });

        function createStreamToBroadcast() {
            var stream = Erizo.Stream({
                audio: false,
                video: true,
                data: false,
                attributes: {participantID: settings.participantId, role: 'participant'},
                videoSize: [640, 480, 640, 480]
            }); 

            console.log(handlers);
            stream.addEventListener('access-accepted', handlers.onCameraAccessAccepted);
            stream.addEventListener('access-denied', handlers.onCameraAccessDenied);

            return stream;
        }

        function initErizoRoom() {
            room = Erizo.Room({token: settings.nuveToken});

            room.addEventListener('room-connected', handlers.onRoomConnected);
            room.addEventListener('room-disconnected', handlers.onRoomDisconnected);
            room.addEventListener('stream-added', handlers.onStreamAdded);
            room.addEventListener('stream-subscribed', handlers.onStreamSubscribed);
            room.addEventListener('stream-unsubscribed', handlers.onStreamUnsubscribed);
            room.addEventListener('stream-removed', handlers.onStreamRemoved);
        }

        /* Licode event handlers, see the official documentation
         * http://lynckia.com/licode/client-api.html#events
         */
        handlers = {
            /* Connects to a Licode room and displays local stream */
            onCameraAccessAccepted: function () {
                showStatusMessage("Connecting to the server...", 'info');
                room.connect();

                var localStream = Erizo.Stream({
                    stream: streamToBroadcast.stream.clone(),
                    video: true,
                });

                localStream.show('js-local-video', {speaker: false});
            },
            onCameraAccessDenied: function () {
                var message = "Camera access denied, please accept appropriate camera " +
                    "using the camera icon at the end of the address bar";
                showStatusMessage(message, 'danger');
            },
            onRoomConnected: function (roomEvent) {
                broadcastedVideoTrack = streamToBroadcast.stream.getVideoTracks()[0];
                broadcastedVideoTrack.enabled = false;
                room.publish(streamToBroadcast, {maxVideoBW: 1000});
                _processNewStreams(roomEvent.streams);
                reloadOnDisconnect(streamToBroadcast);
                hideStatusMessage();
            },
            onRoomDisconnected: function () {
                waitAndReload();
            },
            onStreamAdded: function (streamEvent) {
                _processNewStreams([streamEvent.stream]);
            },
            onStreamSubscribed: function (streamEvent) {

                var stream = streamEvent.stream;

                if (_isBroadcasterStream(stream)) {
                    playButton.button('reset');
                    remoteStreamState = 'subscribed';

                    if (remoteStreamPopup) {
                        _showRemoteStream(stream);
                    } else {
                        room.unsubscribe(stream);
                    }
                }
            },
            onStreamUnsubscribed: function (streamEvent) {
                if (_isBroadcasterStream(streamEvent.stream)) {
                    remoteStreamState = 'added';
                }
            },
            onStreamRemoved: function (streamEvent) {
                var stream = streamEvent.stream;
                if (_isBroadcasterStream(stream)) {
                    _hideRemoteStream(stream);
                    remoteStreamState = undefined;
                }
            },
            /* Holds or unholds broadcaster stream */
            onDataStreamMessage: function(e) {
                console.log("Got message: ", e.msg);
                if (e.msg.participantID == settings.participantId) {
                    broadcastedVideoTrack.enabled = (e.msg.action == 'unhold');
                }

            }
        };

        function bindDOMEvents() {
            playButton = $('#js-play-remote-button');

            playButton.click(function () {
                _createPopup();
                room.subscribe(remoteStream);
                playButton.button('loading');
            });

            $(window).unload(function () {
                if (remoteStreamPopup) {
                    remoteStreamPopup.close();
                }
            });

        }

        function _createPopup() {
            remoteStreamPopup = window.open(undefined, undefined, 'width=1024,height=768');
            remoteStreamPopup.document.write("<title>" + settings.popupTitle + "</title>");
            remoteStreamPopup.document.write("<body style='background: #777; margin: 0; cursor: none;'></body>");

            _bindPopupEvents();
        }

        function _bindPopupEvents() {
            $(remoteStreamPopup).unload(function () {
                remoteStream.stop('js-remote-video');

                if (remoteStreamState !== undefined) {
                    playButton.prop('disabled', false);
                }

                if (remoteStreamState == 'subscribed') {
                    room.unsubscribe(remoteStream);
                    remoteStreamState = 'added';
                }
                remoteStreamPopup = undefined;
            });
        }

        function _processNewStreams(streams) {
            for (var index in streams) {
                var stream = streams[index];

                switch (stream.getAttributes().role) {
                    case 'initiator':
                        room.subscribe(stream);
                        stream.addEventListener('stream-data', handlers.onDataStreamMessage);
                        break;
                    case 'broadcaster':
                        remoteStream = stream;
                        if (remoteStreamPopup) {
                            room.subscribe(remoteStream);
                        } else {
                            playButton.prop('disabled', false);
                        }
                        break;
                }
            }
        }

        function _showRemoteStream(stream) {
            _disablePlayButton();

            stream.play('js-remote-video');
            $('#js-remote-video video').get(0).volume = 0.0;

            var remoteVideoHTML = $('#js-remote-video').html();
            remoteStreamPopup.document.body.innerHTML = remoteVideoHTML;
        }

        function _hideRemoteStream(stream) {
            playButton.button('reset');
            _disablePlayButton();
            stream.stop('js-remote-video');
        }

        function _disablePlayButton() {
            window.setTimeout(function() {
                playButton.prop('disabled', true);
            }, 0);
        }

        function _isBroadcasterStream(stream) {
            return stream.getAttributes().role == 'broadcaster';
        }

    });
