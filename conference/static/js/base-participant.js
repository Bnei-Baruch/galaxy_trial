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
