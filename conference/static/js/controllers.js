/*jshint curly:true, indent:4, strict:true*/

function onLoadCtrl ($scope, $rootScope, $translate) {
    "use strict";

    $rootScope.monitorNumber = 2;
    $rootScope.monitorGroups = {};
    $rootScope.monitors = {};
    
    $scope.keyDown = function(event){
        if(event.which === 17){ //ctrl
            $rootScope.ctrlDown = true;   
        }
        if(event.which === 18){ //alt
            $rootScope.altDown = true;   
        }
        for (var i=1; i<=$rootScope.monitorNumber; i++) {
            if(event.which === (i+48)) {
                $rootScope.$broadcast('transferPreviewToMonitor', i);
            }
        }
    };

    $scope.keyUp = function(event){
        if(event.which === 17){ //ctrl
            $rootScope.ctrlDown = false;
        }
        if(event.which === 18){ //alt
            $rootScope.altDown = false;   
        }
    };

    var addMonitor = function(number) {
        if (number in $rootScope.monitors) {
            alert('Monitor ' + number + ' already exists!');
            return;
        }
        var monitor = window.open("/static/html/monitor.html");
        $rootScope.monitors[number] = monitor;
        $rootScope.monitorGroups[number] = {};
    };

    for (var i=1; i<=$rootScope.monitorNumber; i++) {
        addMonitor(i);
    }

    window.onbeforeunload = function (e) {
        for (var i=1; i<=$rootScope.monitorNumber; i++) {
            $rootScope.monitors[i].close();   
        }
    };
}

onLoadCtrl.$inject = ["$scope", "$rootScope", "$translate"];
function onLoadChatModerator() {
  loadChatModerator(); 
}

onLoadChatModerator.$inject = ["$scope"];

function onLoadMonitorCtrl ($scope, $rootScope, $translate) {
    "use strict";
    $scope.test = function() {
    };
}
onLoadMonitorCtrl.$inject = ["$scope", "$rootScope", "$translate"];

function headerCtrl ($scope, $rootScope) {
}
headerCtrl.$inject = ["$scope","$rootScope"];

function footerCtrl ($scope, $rootScope) {
}
footerCtrl.$inject = ["$scope","$rootScope"];

function bodyCtrl ($scope, $rootScope) {
}
bodyCtrl.$inject = ["$scope","$rootScope"];

function previewCtrl ($scope, $rootScope, $timeout) {
    "use strict";

    $scope.previewList = [];

    $scope.previewHtml = '';
    $scope.showTitle = false;
 	$scope.timeout = $timeout;

    $scope.$on("showGroupPreview", function (e, group) {
        $scope.previewList = [group];
        $rootScope.$broadcast('videoResize');
    });
    $scope.$on("showPresetPreview", function (e, preset) {
        $scope.previewList = preset.groups;
        $rootScope.$broadcast('videoResize');
    });
    $scope.$on("transferPreviewToMonitor", function (e, monitorNumber) {
        // Check if there is a need to unbind videos that is currently on the monitor
        for (var groupId in $rootScope.monitorGroups[monitorNumber]) {
            if (!isGroupOnOtherMonitor(monitorNumber, groupId) && !isGroupOnPreview(groupId)) {
                console.log('Destroy video on monitor ' + monitorNumber + ' ( participantId:' + groupId + ')');
                var streams = $rootScope.room.getStreamsByAttribute('participantID', groupId);
                if (streams !== null && streams[0] !== null) {
                    $rootScope.dataStream.sendData({action: 'hold', participantID: groupId});
                }
                $rootScope.monitorGroups[monitorNumber][groupId] = false;
            }
        }

        // Save the groups that going to be transfer to monitor in monitorGroups
        for (var i=0;i<$scope.previewList.length;i++) {
            var group = $scope.previewList[i];
            $rootScope.monitorGroups[monitorNumber][group.id] = true;
        }

        // Transfer preview to monitor
        var monitor = getMonitor(monitorNumber);
        monitor.showPreview();
    });

    $scope.$on("loadPreviewInMonitors", function (e, monitorNumber) {
        var previewHtml = $('#preview').clone()[0].outerHTML;
        for (var i=1; i<=$rootScope.monitorNumber; i++) {
            $rootScope.monitors[i].loadPreview(previewHtml, $rootScope.resizeVideoLabel);
        }
    });

    $rootScope.resizeVideoLabel = function(videoElement, labelElement) {
        var container = videoElement.parent();
        var size = videoElement.height() / 11;
        if (size < 20 && container !== null && container.width() >= 800) {
            size = 20;
        }
        var cssSize = String(size) + 'pt';
        labelElement.css('font-size', cssSize)
                    .css('line-height', cssSize);
    };

    var getMonitor = function(number) {
        return $rootScope.monitors[number];
    };

    var isGroupOnOtherMonitor = function(monitorNumber,groupId) {
        for (var i=1; i<=$rootScope.monitorNumber; i++) {
            if (i != monitorNumber && $rootScope.monitorGroups[i][groupId] === true) {
                return true;
            }
        }
        return false;
    };

    var isGroupOnPreview = function(groupId) {
        for (var i=0;i<$scope.previewList.length;i++) {
            var group = $scope.previewList[i];
            if (group.id == groupId) {
                return true;
            }
        }
        return false;
    };
}
previewCtrl.$inject = ["$scope","$rootScope","$timeout"];

function presetsCtrl ($scope,$rootScope,GetPresets) {
    "use strict";

    $scope.presets = [];
    $scope.presetIndex = 0;

    $scope.addPreset = function() {
        $scope.presets.push({groups:[], size:1});
        $scope.presetIndex = $scope.presets.length-1;
    };

    $scope.presetClicked = function (index) {
        if ($rootScope.ctrlDown)
        {
            var selectedPreset = $scope.selectedPreset();
            if (selectedPreset.groups.length === 0) {
                $scope.presets.splice(index, 1);
            }
            return;
        }
        $scope.presetIndex = index;
        $rootScope.$broadcast('showPresetPreview', $scope.selectedPreset());
    };

    $scope.removeGroup = function (preset, group) {
        if (!$rootScope.ctrlDown) {
            return;
        }
        if (preset !== null) {
            var curGroupIndex = preset.groups.indexOf(group);
            if (curGroupIndex != -1) {
                preset.groups.splice(curGroupIndex, 1);
            }
        }
        $rootScope.$broadcast('videoResize');
    };

    $scope.$on("addGroupToPreset", function (e, group) {
        if ($scope.presets.length === 0) {
            $scope.addPreset();
        }
        var curPreset = $scope.selectedPreset();
        if (curPreset !== null) {
            var curGroupIndex = curPreset.groups.indexOf(group);
            if (curGroupIndex == -1) {
                curPreset.groups.push(group);
            }
        }
        $rootScope.$broadcast('videoResize');
    });
    $scope.selectedPreset = function()
    {
        return $scope.presets[$scope.presetIndex];
    };

    $scope.getGroupName = function(id) {
        if (id in $rootScope.groupHash) {
            return $rootScope.groupHash[id].name;
        } else {
            return id;
        }
    };

    $rootScope.isGroupInPresets = function(group) {
        for (var i=0; i<$scope.presets.length;i++) {
            var preset = $scope.presets[i];
            if (preset.groups !== null && preset.groups.indexOf(group) > -1) {
                return true;
            }
        }
        return false;
    };

    GetPresets.then(function (data) {
        $scope.presets = data.data.presets;
    }); 
}
presetsCtrl.$inject = ["$scope","$rootScope", "GetPresets"];

function groupsCtrl ($scope, $rootScope, GetGroups) {
    "use strict";

    $scope.selectedGroup = null;
    $scope.groupList = [];
    $rootScope.groupHash = {};

    $scope.groupClicked = function (group) {
        $scope.selectedGroup = group;
        if (group === null) {
            return;
        }
        if ($rootScope.ctrlDown) {
            $rootScope.$broadcast('addGroupToPreset', group);
        } else {
            $rootScope.$broadcast('showGroupPreview', group);
        }
    };

    var getGroupName = function (id) {
        if (id in $rootScope.groupHash) {
            return $rootScope.groupHash[id].name;
        } else {
            return id;
        }
    };

    var setGroupState = function (participantID, state) {
        var group = $rootScope.groupHash[participantID];
        if (group !== undefined) {
            group.state = state;
            $scope.$apply();
        }
    };

    var addConnectingGroup = function (stream) {
        var attrs = stream.getAttributes();
        if (attrs.role == 'participant') {
            setGroupState(attrs.participantID, 'connecting');
            $rootScope.room.subscribe(stream);
        }
    };

    $scope.isGroupConnected = function(group) {
        return group.state == 'connected';
    };

    $scope.isGroupConnecting = function(group) {
        return group.state == 'connecting';
    };

    $scope.isGroupDisconnected = function(group) {
        return group.state == 'disconnected';
    };

    GetGroups.then(function (data) {
        $scope.groupList = data.data.groups;
        for (var i=0; i < $scope.groupList.length; i++) {
            var group = $scope.groupList[i];
            group.state = 'disconnected';
            $rootScope.groupHash[group.id] = group;
        }

        var nuveToken = $('body').data('nuve-token');

        // Stream to send messages to participants
        $rootScope.dataStream = Erizo.Stream({
            data: true,
            attributes: {role: 'initiator'},
        });

        $rootScope.room = Erizo.Room({token: nuveToken});

        $rootScope.room.addEventListener('room-connected', function (roomEvent) {
            for (var index in roomEvent.streams) {
                addConnectingGroup(roomEvent.streams[index]);
            }
            $rootScope.room.publish($rootScope.dataStream);
        });

        $rootScope.room.addEventListener('room-disconnected', function (roomEvent) {
            alert("Connection to the server lost, press OK to retry...");
            location.reload();
        });

        $rootScope.room.addEventListener('stream-subscribed', function(streamEvent) {
            var participantID = streamEvent.stream.getAttributes().participantID;
            setGroupState(participantID, 'connected');
        });

        $rootScope.room.addEventListener('stream-added', function (streamEvent) {
            addConnectingGroup(streamEvent.stream);
        });

        $rootScope.room.addEventListener('stream-removed', function (streamEvent) {
            var participantID = streamEvent.stream.getAttributes().participantID;
            setGroupState(participantID, 'disconnected');
        });

        $rootScope.dataStream.init();
        $rootScope.room.connect();

    }); 
    
    $scope.isGroupInPresets = function(group) {
        return $rootScope.isGroupInPresets(group);
    };

}
groupsCtrl.$inject = ["$scope","$rootScope","GetGroups"];


function groupVideoCtrl ($scope, $rootScope, $timeout) {
    "use strict";
    $scope.videoId = '';
    $scope.timeout = $timeout;
}
groupVideoCtrl.$inject = ["$scope","$rootScope","$timeout"];

