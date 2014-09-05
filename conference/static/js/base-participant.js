/*jshint curly:true, indent:4, strict:true*/

/*
 * Basic functions for participant and broadcaster pages
 * TODO: move under RequireJS, http://requirejs.org/
 */

// Last received heartbeat time stamp
var lastHeartbeatReceived;

// Status alert div
var statusContainer;


$(function () {
    "use strict";
    statusContainer = $('#js-status-container');
});

function initHeartbeatListener() {
    "use strict";

    updateHeartbeat();
    window.setInterval(_checkHeartbeat, 1000);
}

function updateHeartbeat() {
    "use strict";
    lastHeartbeatReceived = Date.now();
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

function _checkHeartbeat() {
    "use strict";

    if (Date.now() - lastHeartbeatReceived > 10000) {
        var message = "Connection with the initiator has been lost, reloading...";
        showStatusMessage(message, 'danger');
        location.reload();
    }
}
