/*jshint curly:true, indent:4, strict:true*/

/*
 * Base module for participant and broadcaster pages
 * TODO: move under RequireJS, http://requirejs.org/
 */

define(
        ['jquery', 'erizo', 'disable-erizo-bar'],
        function ($) {
            "use strict";

            var Module = function (settings) {
                var that = this;

                that.settings = settings;

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

            Module.prototype._roomHandlers = {
                'room-connected': function (roomEvent) {
                    this.handlers.onRoomConnected(roomEvent);

                    this.room.publish(this.streamToBroadcast,
                            {maxVideoBW: this.settings.maxVideoBW});
                    this._processNewStreams(roomEvent.streams);
                    this.reloadOnDisconnect(this.streamToBroadcast);
                    this.hideStatusMessage();
                },
                'room-disconnected': function (roomEvent) {
                    this.handlers.onRoomDisonnected(roomEvent);
                    this.waitAndReload();
                },
                'stream-added': function (streamEvent) {
                    this.handlers.onStreamAdded(streamEvent);
                    this._processNewStreams([streamEvent.stream]);
                },
                'stream-subscribed': function () {
                    this.handlers.onStreamSubscribed(streamEvent);
                },
                'stream-unsubscribed': function () {
                    this.handlers.onStreamUnsubscribed(streamEvent);
                },
                'stream-removed': function () {
                    this.handlers.onStreamRemoved(streamEvent);
                }
            };

            Module.prototype._streamHandlers = {
                'access-accepted': function () {
                    this.showStatusMessage("Connecting to the server...", 'info');
                    this.room.connect();
                    this.handlers.onCameraAccessAccepted();
                },
                'access-denied': function () {
                    var message = "Camera access denied, please accept appropriate camera " +
                        "using the camera icon at the end of the address bar";
                    this.showStatusMessage(message, 'danger');
                    this.handlers.onCameraAccessDenied();
                }
            };

            Module.prototype._createErizoRoom = function () {
                var room = Erizo.Room({token: this.nuveConfig.token});
                this._bindErizoHandlers(room, this._roomHandlers);
                return room;
            };

            Module.prototype._processNewStreams = function (streams) {
                for (var index in streams) {
                    var stream = streams[index];
                    var role = stream.getAttributes().role;
                    this.processNewStream(stream, role);
                }
            };

            Module.prototype._createStreamToBroadcast = function () {
                var stream = this._createStreamToBroadcast();
                this._bindErizoHandlers(stream, this._streamHandlers);
                return stream;
            };

            Module.prototype._bindErizoHandlers = function (object, handlers) {
                for (var eventName in handlers) {
                    room.addEventListener(eventName, handlers[eventName]);
                }
            };

            /* Public methods */

            Module.prototype.initialize = function () {
                console.error("Non-implemented initialize() method called");
            };

            /*
             * Overrides default RTCPeerConnection and reloads the window
             * on connection lost.
             *
             * @param stream: Erizo stream
             * */
            Module.prototype.reloadOnDisconnect = function (stream) {
                var originalHandler = stream.pc.peerConnection.oniceconnectionstatechange;
                stream.pc.peerConnection.oniceconnectionstatechange = function (e) {
                    if (e.target.iceConnectionState == 'disconnected') {
                        waitAndReload();
                    }
                    originalHandler(e);
                };
            };

            Module.prototype.waitAndReload = function () {
                var message = "Connection lost, retrying in few seconds...";
                showStatusMessage(message, 'danger');

                window.setTimeout(function () {
                    location.reload();
                }, 10000);
            };

            Module.prototype.showStatusMessage = function (message, kind) {
                $('body').toggleClass('alert', kind == 'danger');
                var className = statusContainer.prop('class');
                var newClassName = className.replace(/\balert-.+?\b/g, 'alert-' + kind);
                statusContainer.prop('class', newClassName);
                statusContainer.text(message).show();
            };

            Module.prototype.hideStatusMessage = function () {
                $('body').removeClass('alert');
                statusContainer.hide();
            };

            Module.prototype.processNewStream = function (stream, role) {
                console.error("Non-implemented processNewStream() method called");
            };

            return Module;
        });
