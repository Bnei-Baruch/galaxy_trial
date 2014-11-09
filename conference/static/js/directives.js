webrtc.directive("onload", function () {
    return {
        scope: {},
        templateUrl: '/static/html/onload.html',
    };
});

webrtc.directive("header", function () {
    return {
        templateUrl: '/static/html/header.html',
        controller: headerCtrl
    };
});

webrtc.directive("footer", function () {
    return {
        templateUrl: '/static/html/footer.html',
        controller: footerCtrl
    };
});
webrtc.directive("body", function () {
    return {
        templateUrl: '/static/html/body.html',
        controller: bodyCtrl
    };
});
webrtc.directive("preview", function () {
    return {
        templateUrl: '/static/html/preview.html',
        controller: previewCtrl
    };
});
webrtc.directive("presets", function () {
    return {
        templateUrl: '/static/html/presets.html',
        controller: presetsCtrl
    };
});
webrtc.directive("groups", function () {
    return {
        templateUrl: '/static/html/groups.html',
        controller: groupsCtrl
    };
});

webrtc.directive("groupVideo", function ($rootScope) {
    return {
        restrict: 'E',   
        controller: groupVideoCtrl,
        link: function ($scope, element, attrs) {        	
            var isGroupOnMonitor = function(videoId) {
                for (var i=1; i<=$rootScope.monitorNumber; i++) {
                if ($rootScope.monitorGroups[i][videoId] == true)
                    return true;
                }
                return false;
            }

            var getGroupName = function(id) {
                if (id in $rootScope.groupHash)
                    return $rootScope.groupHash[id].name;
                else
                    return id;
            }

            var getGroup = function(id) {
                if (id in $rootScope.groupHash)
                    return $rootScope.groupHash[id];
                else
                    return null;
            }

            var enableAudio = function(enabled) {
                var stream = getStream();
                if (stream) {
                    var audioTracks = stream.stream.getAudioTracks();
                    for (var i=0;i<audioTracks.length;i++)
                      audioTracks[i].enabled = enabled;
                }
            }

            var isMute = function() {
                var stream = getStream();
            	if (stream)
            		return stream.stream.getAudioTracks()[0].enabled;
            	else
            		return true;
            }

            var showStream = function (containerID) {
            	var stream = getStream();

            	if (stream == null)
            		return;

                var participantID = stream.getAttributes().participantID;

                $rootScope.dataStream.sendData({
                    action: 'unhold',
                    participantID: participantID
					
                });                                
                stream.show(containerID, {speaker: false});
                enableAudio(false);                        
                var group = getGroup(participantID);
                group.isPlaying = true;
            };

            var hideStream = function () {
                var stream = getStream();
            	if (stream == null)
            		return;
                var participantID = stream.getAttributes().participantID;

                $rootScope.dataStream.sendData({
                    action: 'hold',
                    participantID: participantID
                });
                enableAudio(false);
                stream.hide();
                var group = getGroup(participantID);
                group.isPlaying = false;
            };

            var getStream = function() {
            	var streams = $rootScope.room.getStreamsByAttribute('participantID', attrs.videoId);
                if (streams) 
                	return streams[0];
                else 
                	return null;
            }

            if ($rootScope.groupHash[attrs.videoId].state == 'connected') {
                console.log("Initialize video (ElementId:" + attrs.id + ' participantId:' + attrs.videoId);

                $scope.timeout(function() {
                    var htmlText = '<div><label>' + getGroupName(attrs.videoId) + '</label></div>';
                    element.append(htmlText);
                    var videoId = attrs.id + '_container';
                    var videoElement = $('#'+videoId);
                    var labelElement = $('label', videoElement);
                    $rootScope.resizeVideoLabel(videoElement, labelElement);
                    showStream(attrs.id);
                    $scope.$on("videoResize", function (e, preset) {
                        $scope.timeout(function() {
                            $rootScope.resizeVideoLabel(videoElement, labelElement);
                        });
                    });
                });
            }

            $scope.$on("enableAudio", function (e, group, audioEnabled) {
            	var stream = getStream();
                if (stream != null && stream.getAttributes().participantID == group.id)
            		enableAudio(audioEnabled);
            });

            $scope.$on('$destroy', function() {
                if (isGroupOnMonitor(attrs.videoId)) {
                    console.log("Skip destroy video (ElementId:" + attrs.id + ' participantId:' + attrs.videoId + ' because it is on monitor');
                    return;
                }
                console.log("Destroy video (ElementId:" + attrs.id + ' participantId:' + attrs.videoId);
                var stream = getStream();
                if (stream) hideStream(stream);
            });    
        }
    };
});

webrtc.directive("onloadMonitor", function () {
    return {
        scope: {},
        templateUrl: '/static/html/onloadMonitor.html',
    };
});
