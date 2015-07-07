var janusStream;

(function (config) {
    var pluginHandles = [];

    Janus.init({
        debug: true,
        callback: initCallback
    });

    ////

    function initCallback() {
        // Create session
        janus = new Janus({
            server: config.participant.janusUri,
            success: function () {
                attachStreamingHandle(1, '#remoteVideo');
                attachStreamingHandle(2, '#remoteAudio');
            },
            error: function(error) {
                console.error(error);
                window.location.reload();
            }
        });

        $(window).unload(function () {
            pluginHandles.forEach(function (handle) {
                var body = { "request": "stop" };
                handle.send({"message": body});
                handle.hangup();
            });

            janus.destroy();
        });
    }

    function attachStreamingHandle(streamId, mediaElementSelector) {
        var streaming;

        janus.attach({
            plugin: "janus.plugin.streaming",
            success: function(pluginHandle) {
                streaming = pluginHandle;
                pluginHandles.push(streaming);

                // Play stream
                var body = { "request": "watch", id: streamId };
                streaming.send({"message": body});
            },
            error: function(error) {
                console.error("Error attaching plugin:", error);
            },
            onmessage: function (msg, jsep) {
                onStreamingMessage(streaming, msg, jsep);
            },
            onremotestream: function(stream) {
                console.debug("Got a remote stream!", stream);
                attachMediaStream($(mediaElementSelector).get(0), stream);
                janusStream = stream;
            },
            oncleanup: function() {
                console.debug("Got a cleanup notification");
            }
        });
    }

    function onStreamingMessage(handle, msg, jsep) {
        console.debug("Got a message", msg);

        var result = msg.result;

        if(jsep !== undefined && jsep !== null) {
            console.debug("Handling SDP as well...", jsep);

            // Answer
            handle.createAnswer({
                jsep: jsep,
                media: { audioSend: false, videoSend: false },	// We want recvonly audio/video
                success: function(jsep) {
                    console.log("Got SDP!");
                    console.log(jsep);
                    var body = { "request": "start" };
                    handle.send({"message": body, "jsep": jsep});
                },
                error: function(error) {
                    console.error("WebRTC error:", error);
                }
            });
        }
    }

})(window.config);
