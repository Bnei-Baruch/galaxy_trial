/*jshint indent:4, strict:true*/

var room, broadcastingStream, videoTrack;

$(function () {
    "use strict";

    var settings = $('body').data();

    broadcastingStream = Erizo.Stream({
        audio: false,
        video: true,
        data: false,
        attributes: {participantID: settings.participantId, role: 'participant'},
        videoSize: [320, 240, 640, 480]
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
        subscribeInitiatorStream(roomEvent.streams);
    }); 

    room.addEventListener('stream-added', function (streamEvent) {
        subscribeInitiatorStream([streamEvent.stream]);
    });

    function subscribeInitiatorStream(streams) {
        for (var index in streams) {
            var stream = streams[index];

            if (stream.getAttributes().role == 'initiator') {
                room.subscribe(stream);

                stream.addEventListener('stream-data', function (e) {
                    console.log("Got message: ", e.msg);
                    if (e.msg.participantID == participantID)
                    videoTrack.enabled = (e.msg.action == 'unhold');
                });
            }
        }
    }

    broadcastingStream.init();
});
