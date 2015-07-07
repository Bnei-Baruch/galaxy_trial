(function (config) {
    var streaming;

    Janus.init({
        debug: true,
        callback: initCallback
    });

    ////

    function initCallback() {
        // Create session
        janus = new Janus({
            server: config.participant.janusUri,
            success: janusSuccess,
            error: function(error) {
                console.error(error);
                window.location.reload();
            }
        });

        $(window).unload(function () {
            if (streaming) {
                var body = { "request": "stop" };
                streaming.send({"message": body});
                streaming.hangup();
            }
            janus.destroy();
        });
    }

    function janusSuccess() {
        // Attach to streaming plugin
        janus.attach({
            plugin: "janus.plugin.streaming",
            success: function(pluginHandle) {
                streaming = pluginHandle;
                playStream(1);
                // playStream(2);
            },
            error: function(error) {
                console.error("Error attaching plugin:", error);
            },
            onmessage: onStreamingMessage,
            onremotestream: function(stream) {
                console.debug("Got a remote stream!", stream);
                attachMediaStream($('#remoteVideo').get(0), stream);
            },
            oncleanup: function() {
                console.debug("Got a cleanup notification");
            }
        });
    }

    function onStreamingMessage(msg, jsep) {
        console.debug("Got a message", msg);

        var result = msg.result;

        if(jsep !== undefined && jsep !== null) {
            console.debug("Handling SDP as well...", jsep);

            // Answer
            streaming.createAnswer({
                jsep: jsep,
                media: { audioSend: false, videoSend: false },	// We want recvonly audio/video
                success: function(jsep) {
                    console.log("Got SDP!");
                    console.log(jsep);
                    var body = { "request": "start" };
                    streaming.send({"message": body, "jsep": jsep});
                },
                error: function(error) {
                    console.error("WebRTC error:", error);
                }
            });
        }
    }

    function playStream(streamId) {
        var body = { "request": "watch", id: streamId };
        streaming.send({"message": body});
    }

})(window.config);
