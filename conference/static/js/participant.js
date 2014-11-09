/*jshint indent:4, strict:true*/

var room;

$(function () {
    "use strict";

    var playButton = $('#js-play-remote-button');

    var settings = $('#js-settings').data();

    // Monkey-patching Erizo player to disable control bar display
    Erizo.Bar = function () {this.display = this.hide = function () {};};

    var videoTrack;
    var remoteStream;
    var remoteStreamPopup;
    var subscribedToRemoteStream = false;

    var broadcastingStream = Erizo.Stream({
        audio: true,
        video: true,
        data: false,
        attributes: {participantID: settings.participantId, role: 'participant'},
        videoSize: [640, 480, 640, 480]
    }); 

    room = Erizo.Room({token: settings.nuveToken});

    broadcastingStream.addEventListener('access-accepted', function () {
        room.connect();

        var localStream = Erizo.Stream({
            stream: broadcastingStream.stream.clone(),
            video: true,
        });

        localStream.show('js-local-video', {speaker: false});
    }); 

    room.addEventListener('room-connected', function (roomEvent) {
        videoTrack = broadcastingStream.stream.getVideoTracks()[0];
        videoTrack.enabled = false;
        room.publish(broadcastingStream, {maxVideoBW: 450});
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
        if (role == 'broadcaster')
            subscribedToRemoteStream = false;
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
        remoteStreamPopup.document.write("<title>Remote stream</title>");
        remoteStreamPopup.document.write("<body style='background: black; margin: 0;'></body>");

        $(remoteStreamPopup).unload(function () {
            remoteStream.stop('js-remote-video');

            if (subscribedToRemoteStream) {
                room.unsubscribe(remoteStream);
                subscribedToRemoteStream = false;
            }

            var broadcasters = room.getStreamsByAttribute('role', 'broadcaster');
            if (broadcasters.length)
                playButton.prop('disabled', false);
            remoteStreamPopup = undefined;
        });


        room.subscribe(remoteStream);
        playButton.button('loading');
    });

    $(window).unload(function () {
        if (remoteStreamPopup)
            remoteStreamPopup.close();
    });

    function processNewStreams(streams) {
        for (var index in streams) {
            var stream = streams[index];
            var role = stream.getAttributes().role;

            switch (role) {
                case 'initiator':
                    room.subscribe(stream);

                    stream.addEventListener('stream-data', function (e) {
                        console.log("Got message: ", e.msg);
                        if (e.msg.participantID == settings.participantId)
                        videoTrack.enabled = (e.msg.action == 'unhold');
                    });
                    break;
                case 'broadcaster':
                    remoteStream = stream;
                    if (remoteStreamPopup)
                        room.subscribe(remoteStream);
                    else
                        playButton.prop('disabled', false);
                    break;
            }
        }
    }

    broadcastingStream.init();
});
