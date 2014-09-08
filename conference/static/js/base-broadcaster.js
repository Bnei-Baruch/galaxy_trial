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
                    // Status alert div
                    that.statusContainer = $('#js-status-container');
                });
            };

            /* Public methods */

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
