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

            var showStream = function (stream, containerID) {
                var participantID = stream.getAttributes().participantID;

                $rootScope.dataStream.sendData({
                    action: 'unhold',
                    participantID: participantID
                });
                stream.show(containerID, {speaker: false});
            };

            var hideStream = function (stream) {
                var participantID = stream.getAttributes().participantID;

                $rootScope.dataStream.sendData({
                    action: 'hold',
                    participantID: participantID
                });
                stream.hide();
            };

            if ($rootScope.groupHash[attrs.videoId].state == 'connected') {
                console.log("Initialize video (ElementId:" + attrs.id + ' participantId:' + attrs.videoId);

                var streams = $rootScope.room.getStreamsByAttribute('participantID', attrs.videoId);

                $scope.timeout(function() {
                    var labelId = 'label_' + attrs.id;
                    var htmlText = '<div><label id="' + labelId + '">' + getGroupName(attrs.videoId) + '</label></div>';
                    element.append(htmlText);
                    var videoId = attrs.id + '_container';
                    var labelElement = $('#'+labelId);
                    var videoElement = $('#'+videoId);
                    $rootScope.resizeVideoLabel(videoElement, labelElement);
                    showStream(streams[0], attrs.id);
                    $scope.$on("videoResize", function (e, preset) {
                        $scope.timeout(function() {
                            $rootScope.resizeVideoLabel(videoElement, labelElement);
                        });
                    });
                });
            }

            $scope.$on('$destroy', function() {
                if (isGroupOnMonitor(attrs.videoId)) {
                    console.log("Skip destroy video (ElementId:" + attrs.id + ' participantId:' + attrs.videoId + ' because it is on monitor');
                    return;
                }
                console.log("Destroy video (ElementId:" + attrs.id + ' participantId:' + attrs.videoId);
                var streams = $rootScope.room.getStreamsByAttribute('participantID', attrs.videoId);
                if (streams && streams[0]) hideStream(streams[0]);
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
