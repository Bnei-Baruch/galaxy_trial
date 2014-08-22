/*jshint indent:4, strict:true*/

var room, localStream;

$(function () {
    "use strict";

    var nuveData = $('#js-nuve-data').data();

    // Monkey-patching Erizo player to disable control bar display
    Erizo.Bar = function () {this.display = this.hide = function () {};};

    localStream = Erizo.Stream({
        audio: true,
        video: true,
        attributes: {role: 'broadcaster'},
        videoSize: [720, 576, 720, 576]
    }); 

    var room = Erizo.Room({token: nuveData.token});

    localStream.addEventListener('access-accepted', function () {
        room.connect();
        localStream.play('js-local-video');
    }); 

    room.addEventListener('room-connected', function (roomEvent) {
        room.publish(localStream, {maxVideoBW: 450});
    }); 

    localStream.init();
});
