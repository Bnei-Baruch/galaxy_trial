/*jshint curly:true, indent:4, strict:true*/

var settings, room, handlers, streamToBroadcast,
    broadcastedVideoTrack, remoteStream, remoteStreamPopup, playButton;

// Can be undefined, 'added' or 'subscribed'
var remoteStreamState;

$(function () {
    "use strict";

    settings = $('#js-settings').data();

    streamToBroadcast = createStreamToBroadcast();

    initErizoRoom();
    bindDOMEvents();

    streamToBroadcast.init();
});

function createStreamToBroadcast() {
    "use strict";

    var stream = Erizo.Stream({
        audio: false,
        video: true,
        data: false,
        attributes: {participantID: settings.participantId, role: 'participant'},
        videoSize: [640, 480, 640, 480]
    }); 

    stream.addEventListener('access-accepted', handlers.onCameraAccessAccepted);

    return stream;
}

function initErizoRoom() {
    "use strict";

    room = Erizo.Room({token: settings.nuveToken});
    
    room.addEventListener('room-connected', handlers.onRoomConnected);
    room.addEventListener('stream-added', handlers.onStreamAdded);
    room.addEventListener('stream-subscribed', handlers.onStreamSubscribed);
    room.addEventListener('stream-unsubscribed', handlers.onStreamUnsubscribed);
    room.addEventListener('stream-removed', handlers.onStreamRemoved);
}

handlers = {
    /* Connects to a Licode room and displays local stream */
    onCameraAccessAccepted: function () {
        "use strict";

        room.connect();

        var localStream = Erizo.Stream({
            stream: streamToBroadcast.stream.clone(),
            video: true,
        });

        localStream.show('js-local-video', {speaker: false});
    },
    onRoomConnected: function (roomEvent) {
        "use strict";

        broadcastedVideoTrack = streamToBroadcast.stream.getVideoTracks()[0];
        broadcastedVideoTrack.enabled = false;
        room.publish(streamToBroadcast, {maxVideoBW: 450});
        _processNewStreams(roomEvent.streams);
    },
    onStreamAdded: function (streamEvent) {
        "use strict";
        _processNewStreams([streamEvent.stream]);
    },
    onStreamSubscribed: function (streamEvent) {
        "use strict";

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
        "use strict";

        if (_isBroadcasterStream(streamEvent.stream)) {
            remoteStreamState = 'added';
        }
    },
    onStreamRemoved: function (streamEvent) {
        "use strict";

        var stream = streamEvent.stream;
        if (_isBroadcasterStream(stream)) {
            _hideRemoteStream(stream);
            remoteStreamState = undefined;
        }
    },
    /* Holds or unholds broadcaster stream */
    onDataStreamMessage: function(e) {
        "use strict";

        console.log("Got message: ", e.msg);
        if (e.msg.participantID == settings.participantId) {
            broadcastedVideoTrack.enabled = (e.msg.action == 'unhold');
        }
    }
};

function bindDOMEvents() {
    "use strict";

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
    "use strict";

    remoteStreamPopup = window.open(undefined, undefined, 'width=1024,height=768');
    remoteStreamPopup.document.write("<title>" + settings.popupTitle + "</title>");
    remoteStreamPopup.document.write("<body style='background: #777; margin: 0;'></body>");

    _bindPopupEvents();
}

function _bindPopupEvents() {
    "use strict";

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
    "use strict";

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
    "use strict";

    _disablePlayButton();

    stream.play('js-remote-video');
    $('#js-remote-video video').get(0).volume = 0.0;

    var remoteVideoHTML = $('#js-remote-video').html();
    remoteStreamPopup.document.body.innerHTML = remoteVideoHTML;
}

function _hideRemoteStream(stream) {
    "use strict";
    playButton.button('reset');
    _disablePlayButton();
    stream.stop('js-remote-video');
}

function _disablePlayButton() {
    "use strict";
    window.setTimeout(function() {
        playButton.prop('disabled', true);
    }, 0);
}

function _isBroadcasterStream(stream) {
    "use strict";
    return stream.getAttributes().role == 'broadcaster';
}
