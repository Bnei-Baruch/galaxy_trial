/*jshint curly:true, indent:4, strict:true*/

var room;

$(function () {
    "use strict";

    var settings = $('#js-settings').data();

    var playButton = $('#js-play-remote-button');

    var videoTrack;
    var remoteStream;
    var remoteStreamPopup;

    // Call room.unsubscribe() only if subscribed to remote stream
    var subscribedToRemoteStream = false;

    // Actual stream we broadcast, it's not used to display the video locally
    // in order to not to confuse the user with blinking video when holding/unholding
    var streamToBroadcast = Erizo.Stream({
        audio: false,
        video: true,
        data: false,
        attributes: {participantID: settings.participantId, role: 'participant'},
        videoSize: [640, 480, 640, 480]
    }); 

    room = Erizo.Room({token: settings.nuveToken});

    // Camera access granted by user
    streamToBroadcast.addEventListener('access-accepted', function () {
        room.connect();

        var localStream = Erizo.Stream({
            stream: streamToBroadcast.stream.clone(),
            video: true,
        });

        localStream.show('js-local-video', {speaker: false});
    }); 

    // Connected to a Licode room
    room.addEventListener('room-connected', function (roomEvent) {
        videoTrack = streamToBroadcast.stream.getVideoTracks()[0];

        // Holding the stream before publishing by disabling the video track
        videoTrack.enabled = false;

        room.publish(streamToBroadcast, {maxVideoBW: 450});
        processNewStreams(roomEvent.streams);
    }); 

    room.addEventListener('stream-added', function (streamEvent) {
        processNewStreams([streamEvent.stream]);
    });

    room.addEventListener('stream-subscribed', function (streamEvent) {
        var role = streamEvent.stream.getAttributes().role;
        if (role == 'broadcaster') {
            playButton.button('reset');
            subscribedToRemoteStream = true;

            if (remoteStreamPopup) {
                window.setTimeout(function() {
                    playButton.prop('disabled', true);
                }, 0);

                streamEvent.stream.play('js-remote-video');
                $('#js-remote-video video').get(0).volume = 0.0;

                var remoteVideoHTML = $('#js-remote-video').html();
                remoteStreamPopup.document.body.innerHTML = remoteVideoHTML;

                playButton.prop('disabled', true);
            } else {
                room.unsubscribe(streamEvent.stream);
            }
        }
    });

    room.addEventListener('stream-unsubscribed', function (streamEvent) {
        var role = streamEvent.stream.getAttributes().role;
        if (role == 'broadcaster') {
            subscribedToRemoteStream = false;
        }
    });

    room.addEventListener('stream-removed', function (streamEvent) {
        var role = streamEvent.stream.getAttributes().role;

        if (role == 'broadcaster') {
            playButton.button('reset');
            window.setTimeout(function() {
                playButton.prop('disabled', true);
            }, 0);
            streamEvent.stream.stop('js-remote-video');
            subscribedToRemoteStream = false;
        }
    });

    playButton.click(function () {
        remoteStreamPopup = window.open(undefined, undefined, 'width=1024,height=768');
        remoteStreamPopup.document.write("<title>" + settings.popupTitle + "</title>");
        remoteStreamPopup.document.write("<body style='background: black; margin: 0;'></body>");

        $(remoteStreamPopup).unload(function () {
            remoteStream.stop('js-remote-video');

            if (subscribedToRemoteStream) {
                room.unsubscribe(remoteStream);
                subscribedToRemoteStream = false;
            }

            var broadcasters = room.getStreamsByAttribute('role', 'broadcaster');
            if (broadcasters.length) {
                playButton.prop('disabled', false);
            }
            remoteStreamPopup = undefined;
        });


        room.subscribe(remoteStream);
        playButton.button('loading');
    });

    $(window).unload(function () {
        if (remoteStreamPopup) {
            remoteStreamPopup.close();
        }
    });

    function processNewStreams(streams) {
        for (var index in streams) {
            var stream = streams[index];
            var role = stream.getAttributes().role;

            switch (role) {
                case 'initiator':
                    room.subscribe(stream);
                    stream.addEventListener('stream-data', onDataMessage);
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

    function onDataMessage(e) {
        console.log("Got message: ", e.msg);
        if (e.msg.participantID == settings.participantId) {
            videoTrack.enabled = (e.msg.action == 'unhold');
        }
    }

    streamToBroadcast.init();
});
