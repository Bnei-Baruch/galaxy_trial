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

            $scope.timeout(function() {
                var htmlText = '<div><label>' + getGroupName(attrs.videoId) + '</label></div>';
                element.append(htmlText);
            });

            console.log("Initialize video (ElementId:" + attrs.id + ' participantId:' + attrs.videoId);

            $rootScope.participantElementIDs[attrs.videoId] = attrs.id;

            var streams = $rootScope.room.getStreamsByAttribute('participantID', attrs.videoId);

            if (!isGroupOnMonitor(attrs.videoId)) {
                $rootScope.room.subscribe(streams[0]);
                streams[0].play();
            } else {
                $scope.timeout(function() {
                    streams[0].show(attrs.id, {speaker: false});
                });
            }

            $scope.$on('$destroy', function() {
                if (isGroupOnMonitor(attrs.videoId)) {
                    console.log("Skip destroy video (ElementId:" + attrs.id + ' participantId:' + attrs.videoId + ' because it is on monitor');
                    return;
                }
                console.log("Destroy video (ElementId:" + attrs.id + ' participantId:' + attrs.videoId);
                var streams = $rootScope.room.getStreamsByAttribute('participantID', attrs.videoId);
                if (streams != null && streams[0] != null)
                    $rootScope.room.unsubscribe(streams[0]);
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
