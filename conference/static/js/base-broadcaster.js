/*jshint curly:true, indent:4, strict:true*/

/*
 * Base module for participant and broadcaster pages
 * TODO: move under RequireJS, http://requirejs.org/
 */

define(
        ['jquery', 'erizo', 'disable-erizo-bar'],
        function ($) {
            "use strict";

            var Module = function () {
                var that = this;

                $(function () {
                    // Preloading DOM objects
                    that.settings = $('#js-settings').data();
                    that.statusContainer = $('#js-status-container');

                    that.initialize();
                });
            };

            /* Public methods */

            Module.prototype.initErizoRoom = function () {
                var that = this;

                that.room = Erizo.Room({token: settings.nuveToken});
                that.room.addEventListener('room-connected', handlers.onRoomConnected);
                that.room.addEventListener('room-disconnected', handlers.onRoomDisconnected);
                that.room.addEventListener('stream-added', handlers.onStreamAdded);
                that.room.addEventListener('stream-subscribed', handlers.onStreamSubscribed);
                that.room.addEventListener('stream-unsubscribed', handlers.onStreamUnsubscribed);
                that.room.addEventListener('stream-removed', handlers.onStreamRemoved);
            }

            /* 
             * Dummy initializer
             */
            Module.prototype.initialize = function () {
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

            return Module;
        });
