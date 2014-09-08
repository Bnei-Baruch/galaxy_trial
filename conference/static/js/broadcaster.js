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

    var room = Erizo.Room({token: settings.nuveToken});

    localStream.addEventListener('access-accepted', function () {
        room.connect();
        localStream.play('js-local-video');
    }); 

    room.addEventListener('room-connected', function (roomEvent) {
        room.publish(localStream, {maxVideoBW: 2000});
    }); 

    localStream.init();
});
