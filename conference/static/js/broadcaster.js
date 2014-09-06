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
        showStatusMessage("Connecting to the server...", 'info');
        room.connect();
        localStream.play('js-local-video');
    }); 

    localStream.addEventListener('access-denied', function () {
        var message = "Camera access denied, please accept appropriate camera " +
            "using the camera icon at the end of the address bar";
        showStatusMessage(message, 'danger');
    });

    room.addEventListener('room-connected', function (roomEvent) {
        room.publish(localStream, {maxVideoBW: 2000});
        reloadOnDisconnect(localStream);
        hideStatusMessage();
    }); 

    room.addEventListener('room-disconnected', function (roomEvent) {
        waitAndReload();
    }); 

    localStream.init();
});
