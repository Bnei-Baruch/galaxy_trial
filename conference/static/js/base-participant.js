/*jshint curly:true, indent:4, strict:true*/

/*
 * Basic functions for participant and broadcaster pages
 * TODO: move under RequireJS, http://requirejs.org/
 */

// Status alert div
var statusContainer;


$(function () {
    "use strict";
    statusContainer = $('#js-status-container');
});

function reloadOnDisconnect(stream) {
    "use strict";

    var originalHandler = stream.pc.peerConnection.oniceconnectionstatechange;
    stream.pc.peerConnection.oniceconnectionstatechange = function (e) {
        if (e.target.iceConnectionState == 'disconnected') {
            waitAndReload();
        }
        originalHandler(e);
    };
}

function waitAndReload() {
    "use strict";

    var message = "Connection lost, retrying in few seconds...";
    showStatusMessage(message, 'danger');

    window.setTimeout(function () {
        location.reload();
    }, 10000);
}

function showStatusMessage(message, kind) {
    "use strict";

    $('body').toggleClass('alert', kind == 'danger');
    var className = statusContainer.prop('class');
    var newClassName = className.replace(/\balert-.+?\b/g, 'alert-' + kind);
    statusContainer.prop('class', newClassName);
    statusContainer.text(message).show();
}

function hideStatusMessage() {
    "use strict";
    $('body').removeClass('alert');
    statusContainer.hide();
}

