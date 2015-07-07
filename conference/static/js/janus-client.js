var	server = window.location.protocol + "//146.185.60.46:8088/janus";
var streaming;

// Initialize the library (console debug enabled)
Janus.init({
    debug: true,
    callback: function() {
        {
            // Create session
            janus = new Janus(
                {
                    server: server,
            success: function() {
                // Attach to streaming plugin
                janus.attach({
                    plugin: "janus.plugin.streaming",
                    success: function(pluginHandle) {
                    streaming = pluginHandle;
                },
                error: function(error) {
                    console.error("Error attaching plugin:", error);
                },
                onmessage: function(msg, jsep) {
                    console.log(" ::: Got a message :::");
                    console.log(JSON.stringify(msg));
                    var result = msg["result"];
                    if(jsep !== undefined && jsep !== null) {
                        console.log("Handling SDP as well...");
                        console.log(jsep);
                        // Answer
                        streaming.createAnswer(
                                {
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
                },
                onremotestream: function(stream) {
                    console.debug("Got a remote stream!", stream);
                    attachMediaStream($('#remoteVideo').get(0), stream);
                },
                oncleanup: function() {
                    console.debug("Got a cleanup notification");
                }
                    });

            },
            error: function(error) {
                console.error(error);
                window.location.reload();
            },
            destroyed: function() {
                window.location.reload();
            }
                });
        });
    }});
});

var body = { "request": "watch", id: parseInt(selectedStream) };
streaming.send({"message": body});
