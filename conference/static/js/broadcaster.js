/*jshint curly:true, indent:4, strict:true*/

var room, localStream;

$(function () {
    "use strict";

    var settings = $('#js-settings').data();

    localStream = Erizo.Stream({
        audio: true,
        video: true,
        attributes: {role: 'broadcaster'},
        videoSize: [720, 576, 720, 576]
    }); 

    room = Erizo.Room({token: settings.nuveToken});

    localStream.addEventListener('access-accepted', function () {
        room.connect();
        initHeartbeatListener();
        localStream.play('js-local-video');
    }); 

    localStream.addEventListener('access-denied', function () {
        var message = "Camera access denied, please accept appropriate camera " +
            "using the camera icon at the end of the address bar";
        showStatusMessage(message, 'danger');
    });

    room.addEventListener('room-connected', function (roomEvent) {
        room.publish(localStream, {maxVideoBW: 2000});
        _processNewStreams(roomEvent.streams);
    }); 

    room.addEventListener('stream-added', function (streamEvent) {
        _processNewStreams([streamEvent.stream]);
    });

    localStream.init();
});

function _processNewStreams(streams) {
    "use strict";

    for (var index in streams) {
        var stream = streams[index];

        if (stream.getAttributes().role == 'initiator') {
            console.log("Initiator's stream", stream);
            room.subscribe(stream);
            stream.addEventListener('stream-data', _onDataStreamMessage);
        }
    }
}

function _onDataStreamMessage(e) {
    "use strict";

    console.log("Got message: ", e.msg);
    if (e.msg.action == 'update-heartbeat') {
        updateHeartbeat();
    }
}
