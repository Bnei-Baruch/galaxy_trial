webrtc.directive("onload", function () {
    return {
        scope: {},
        templateUrl: './html/onload.html',
    };
});

webrtc.directive("header", function () {
    return {
        templateUrl: './html/header.html',
        controller: headerCtrl
    };
});

webrtc.directive("footer", function () {
    return {
        templateUrl: 'html/footer.html',
        controller: footerCtrl
    };
});
webrtc.directive("body", function () {
    return {
        templateUrl: 'html/body.html',
        controller: bodyCtrl
    };
});
webrtc.directive("preview", function () {
    return {
        templateUrl: 'html/preview.html',
        controller: previewCtrl
    };
});
webrtc.directive("presets", function () {
    return {
        templateUrl: 'html/presets.html',
        controller: presetsCtrl
    };
});
webrtc.directive("groups", function () {
    return {
        templateUrl: 'html/groups.html',
        controller: groupsCtrl
    };
});

webrtc.directive("groupVideo", function ($rootScope) {
    return {
        restrict: 'E',   
        link: function ($scope, element, attrs) {
          console.log("Initialize video (ElementId:" + attrs.id + ' participantId:' + attrs.videoId);

          $rootScope.participantElementIDs[attrs.videoId] = attrs.id;

          var streams = $rootScope.room.getStreamsByAttribute('participantID', attrs.videoId);
          $rootScope.room.subscribe(streams[0]);

          $scope.$on('$destroy', function() {
            console.log("Destroy video (ElementId:" + attrs.id + ' participantId:' + attrs.videoId);
            var streams = $rootScope.room.getStreamsByAttribute('participantID', attrs.videoId);
            $rootScope.room.unsubscribe(streams[0]);
          });
        }

    };
});

webrtc.directive("onloadMonitor", function () {
    return {
        scope: {},
        templateUrl: './html/onloadMonitor.html',
    };
});
