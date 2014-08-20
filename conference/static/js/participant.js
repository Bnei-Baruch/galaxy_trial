/*jshint indent:4, strict:true*/

var room;

$(function () {
    "use strict";

    var playButton = $('#js-play-remote-button');

    var settings = $('#js-settings').data();

    // Monkey-patching Erizo player to disable control bar display
    Erizo.Bar = function () {this.display = this.hide = function () {}};

    var remoteStream, videoTrack;

    var broadcastingStream = Erizo.Stream({
        audio: false,
        video: true,
        data: false,
        attributes: {participantID: settings.participantId, role: 'participant'},
        videoSize: [640, 480, 640, 480]
    }); 

    var room = Erizo.Room({token: settings.nuveToken});

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

    room.addEventListener('stream-removed', function (streamEvent) {
        var role = streamEvent.stream.getAttributes().role;
    });

    playButton.click(function () {
        window.open();
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
                    playButton.prop('disabled', false);
                    break;
            }
        }
    }

    broadcastingStream.init();
});
