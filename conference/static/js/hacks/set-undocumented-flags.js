/*jshint curly:true, indent:4, strict:true*/

(function () {
    "use strict";

    var OrigPeerConnection = webkitRTCPeerConnection;

    // Apply undocumented WebRTC setting to webkitRTCPeerConnection 
    webkitRTCPeerConnection = function (configuration, constraints) {
        var customConstraints = {
            mandatory: {
                DtlsSrtpKeyAgreement: true,
                RtpDataChannels: true
            },
            optional: [
                {googSkipEncodingUnusedStreams: true},
                {googImprovedWifiBwe: true},
                {googHighBitrate: true},
                {googVeryHighBitrate: true}
            ]
        };
        return new OrigPeerConnection(configuration, customConstraints);
    };
})();
