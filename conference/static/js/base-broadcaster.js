/*jshint curly:true, indent:4, strict:true*/

/*
 * Base module for participant and broadcaster pages
/* TODO: Integrate into the AngularJS app
 */

window.BaseBroadcaster = (function ($, config) {
    "use strict";

    var BaseBroadcaster = function (settings, licodeHandlers) {
        var that = this;

        that.settings = settings;
        that.handlers = licodeHandlers;

        $(function () {
            that.nuveConfig = $('#js-nuve-config').data();

            // Preloading DOM objects
            that.statusContainer = $('#js-status-container');

            that.streamToBroadcast = that._createStreamToBroadcast();
            that.room = that._createErizoRoom();
            that.initialize();
            that.streamToBroadcast.init();
        });
    };

    /*
     * Erizo room handlers object getter.
     *
     * See the official documentation on Licode event handlers,
     * http://lynckia.com/licode/client-api.html#events
     * */
    BaseBroadcaster.prototype._getRoomHandlers = function (that) {
        var roomHandlers = {
            'room-connected': function (roomEvent) {
                that._callCustomHandler('onRoomConnected', roomEvent);

                that.room.publish(that.streamToBroadcast,
                        {maxVideoBW: that.settings.maxVideoBW});
                that._processNewStreams(roomEvent.streams);
                that.reloadOnDisconnect(that.streamToBroadcast);
                that.hideStatusMessage();
            },
            'room-disconnected': function (roomEvent) {
                that._callCustomHandler('onRoomDisonnected', roomEvent);
                that.waitAndReload();
            },
            'stream-added': function (streamEvent) {
                that._callCustomHandler('onStreamAdded', streamEvent);
                that._processNewStreams([streamEvent.stream]);
            },
            'stream-subscribed': function (streamEvent) {
                that._callCustomHandler('onStreamSubscribed', streamEvent);
            },
            'stream-unsubscribed': function (streamEvent) {
                that._callCustomHandler('onStreamUnsubscribed', streamEvent);
            },
            'stream-removed': function (streamEvent) {
                that._callCustomHandler('onStreamRemoved', streamEvent);
            }
        };

        return roomHandlers;
    };

    /*
     * Erizo stream handlers object getter.
     *
     * See the official documentation on Licode event handlers,
     * http://lynckia.com/licode/client-api.html#events
     * */
    BaseBroadcaster.prototype._getStreamHandlers = function (that) {
        var streamHandlers = {
            'access-accepted': function () {
                that.showStatusMessage("Connecting to the server...", 'info');
                that.room.connect();
                that._callCustomHandler('onCameraAccessAccepted');
            },
            'access-denied': function () {
                var message = "Camera access denied, please accept appropriate camera " +
                    "using the camera icon at the end of the address bar";
                that.showStatusMessage(message, 'danger');
                that._callCustomHandler('onCameraAccessDenied');
            }
        };

        return streamHandlers;
    };

    BaseBroadcaster.prototype._createErizoRoom = function () {
        var room = Erizo.Room({token: this.nuveConfig.token});
        this._bindErizoHandlers(room, this._getRoomHandlers);
        return room;
    };

    BaseBroadcaster.prototype._processNewStreams = function (streams) {
        for (var index in streams) {
            var stream = streams[index];
            var role = stream.getAttributes().role;
            this.processNewStream(stream, role);
        }
    };

    BaseBroadcaster.prototype._createStreamToBroadcast = function () {
        var stream = this.createStreamToBroadcast();
        this._bindErizoHandlers(stream, this._getStreamHandlers);
        return stream;
    };

    BaseBroadcaster.prototype._bindErizoHandlers = function (object, handlersGetter) {
        var handlers = handlersGetter(this);
        for (var eventName in handlers) {
            object.addEventListener(eventName, handlers[eventName]);
        }
    };

    BaseBroadcaster.prototype._callCustomHandler = function (name, e) {
        if (this.handlers[name] !== undefined) {
            this.handlers[name](this, e);
        }
    };

    /* Public methods */

    /*
     * Override for DOM initialization.
     * */
    BaseBroadcaster.prototype.initialize = function () {
        console.warn("Non-implemented initialize() method called");
    };

    /*
     * Override to perform custom actions on new streams.
     *
     * @param stream: Erizo stream
     * @param role: stream's role name
     * */
    BaseBroadcaster.prototype.processNewStream = function (stream, role) {
        console.warn("Non-implemented processNewStream() method called");
    };

    /*
     * Has to be overriden in order to create a local stream to broadcast.
     *
     * @param stream: Erizo stream
     * @param role: stream's role name
     * */
    BaseBroadcaster.prototype.createStreamToBroadcast = function (stream, role) {
        console.error("Non-implemented createStreamToBroadcast() method called");
    };

    /*
     * Overrides default RTCPeerConnection and reloads the window
     * on connection lost.
     *
     * @param stream: Erizo stream
     * */
    BaseBroadcaster.prototype.reloadOnDisconnect = function (stream) {
        var originalHandler = stream.pc.peerConnection.oniceconnectionstatechange;
        stream.pc.peerConnection.oniceconnectionstatechange = function (e) {
            if (e.target.iceConnectionState == 'disconnected') {
                that.waitAndReload();
            }
            originalHandler(e);
        };
    };

    /*
     * Waits for the timeout specified in config.reloadOnDisconnectTimeout
     * and reloads the window.
     * */
    BaseBroadcaster.prototype.waitAndReload = function () {
        var message = "Connection lost, retrying in few seconds...";
        this.showStatusMessage(message, 'danger');

        window.setTimeout(function () {
            location.reload();
        }, config.reloadOnDisconnectTimeout);
    };

    /*
     * Displays status message.
     *
     * @param message: message string
     * @param kind: 'success', 'info', 'warning' or 'danger'
     * */
    BaseBroadcaster.prototype.showStatusMessage = function (message, kind) {
        console.log(message, kind);
        $('body').toggleClass('alert', kind == 'danger');
        var className = this.statusContainer.prop('class');
        var newClassName = className.replace(/\balert-.+?\b/g, 'alert-' + kind);
        this.statusContainer.prop('class', newClassName);
        this.statusContainer.text(message).show();
    };

    /* Hides the status message.
     * */
    BaseBroadcaster.prototype.hideStatusMessage = function () {
        $('body').removeClass('alert');
        this.statusContainer.hide();
    };

    return BaseBroadcaster;
})(jQuery, window.config);
