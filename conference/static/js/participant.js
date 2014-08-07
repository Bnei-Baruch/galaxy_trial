
/*jshint indent:4, strict:true*/

$(function () {
    "use strict";

    var settings = $('body').data();

    var localStream = Erizo.Stream({
        audio: false,
        video: true,
        data: true,
        attributes: {participantID: settings.participantId},
        videoSize: [320, 240, 640, 480]
    }); 

    var room = Erizo.Room({token: settings.nuveToken});

    localStream.addEventListener('access-accepted', function () {
        room.connect();
        localStream.show('js-local-video', {speaker: false});
    }); 

    room.addEventListener('room-connected', function (roomEvent) {
        room.publish(localStream, {maxVideoBW: 450});
    }); 

    localStream.init();
});
