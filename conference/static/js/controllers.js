/*jshint indent:4, strict:true*/
function onLoadCtrl ($scope, $rootScope, $translate) {
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
    }

    $scope.keyUp = function(event){
        if(event.which === 17){ //ctrl
            $rootScope.ctrlDown = false;
        }
        if(event.which === 18){ //alt
            $rootScope.altDown = false;   
        }
    }

    var addMonitor = function(number) {
        if (number in $rootScope.monitors) {
            alert('Monitor ' + number + ' already exists!');
            return;
        }
        var monitor = window.open("/static/html/monitor.html");
        $rootScope.monitors[number] = monitor;
        $rootScope.monitorGroups[number] = {};
    }

    for (var i=1; i<=$rootScope.monitorNumber; i++)
        addMonitor(i);

    window.onbeforeunload = function (e) {
        for (var i=1; i<=$rootScope.monitorNumber; i++) 
            $rootScope.monitors[i].close();   
    };
}
onLoadCtrl.$inject = ["$scope", "$rootScope", "$translate"];

function onLoadMonitorCtrl ($scope, $rootScope, $translate) {
    $scope.test = function() {
        //alert('test');
    }
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

function previewCtrl ($scope, $rootScope) {
    $scope.previewList = [];

    $scope.previewHtml = '';
    $scope.showTitle = false;
    $scope.$on("showGroupPreview", function (e, group) {
        $scope.previewList = [group];
        //$scope.$apply();
    });
    $scope.$on("showPresetPreview", function (e, preset) {
        $scope.previewList = preset.groups;
        //$scope.$apply();
    });
    $scope.$on("transferPreviewToMonitor", function (e, monitorNumber) {
        // Check if there is a need to unbind videos that is currently on the monitor
        for (var groupId in  $rootScope.monitorGroups[monitorNumber]) {
            if (!isGroupOnOtherMonitor(monitorNumber, groupId)) {
                console.log('Destroy video on monitor ' + monitorNumber + ' ( participantId:' + groupId + ')');
                var streams = $rootScope.room.getStreamsByAttribute('participantID', groupId);
                if (streams != null && streams[0] != null) {
                    $rootScope.room.unsubscribe(streams[0]);
                }
            }
        }

        // Save the groups that going to be transfer to monitor in monitorGroups
        for (var i=0;i<$scope.previewList.length;i++) {
            var group = $scope.previewList[i];
            $rootScope.monitorGroups[monitorNumber][group.id] = true;
        }

        // Transfer preview to monitor
        var monitor = getMonitor(monitorNumber);
        var previewHtml = $('#preview').clone()[0].outerHTML;
        monitor.showPreview(previewHtml);
    });
    var getMonitor = function(number) {
        return $rootScope.monitors[number];
    }
    var isGroupOnOtherMonitor = function(monitorNumber,groupId) {
        for (var i=1; i<=$rootScope.monitorNumber; i++) {
            if (i != monitorNumber && $rootScope.monitorGroups[i][groupId] == true)
                return true;
            }
        return false;
    }
    var isGroupOnPreview = function(groupId) {
        for (var i=0;i<$scope.previewList.length;i++) {
        	var group = $scope.previewList[i];
        	if (group.id == groupId)
        		return true;
        }
        return false;
    }

    $scope.isGroupConected = function(group) {
        for (var i=0; i < $scope.conectedGroups.length; i++)
            if ($scope.conectedGroups[i].id == group.id)
                return true;
        return false;
    }

}
previewCtrl.$inject = ["$scope","$rootScope"];

function presetsCtrl ($scope,$rootScope,GetPresets) {
    $scope.presets = [];
    $scope.presetIndex = 0;

    $scope.addPreset = function() {
        $scope.presets.push({groups:[], size:1});
        $scope.presetIndex = $scope.presets.length-1;
    }

    $scope.presetClicked = function (index) {
        if ($rootScope.ctrlDown)
        {
            var selectedPreset = $scope.selectedPreset();
            if (selectedPreset.groups.length == 0)
                $scope.presets.splice(index, 1);
            return;
        }
        $scope.presetIndex = index;
        $rootScope.$broadcast('showPresetPreview', $scope.selectedPreset());
    }

    $scope.removeGroup = function (preset, group) {
        if (!$rootScope.ctrlDown)
            return;   
        if (preset != null) {
            var curGroupIndex = preset.groups.indexOf(group);
            if (curGroupIndex != -1)
                preset.groups.splice(curGroupIndex, 1);
        }
    }

    $scope.$on("addGroupToPreset", function (e, group) {
        if ($scope.presets.length == 0)
        $scope.addPreset();
    var curPreset = $scope.selectedPreset();
    if (curPreset != null)
    {
        var curGroupIndex = curPreset.groups.indexOf(group);
        if (curGroupIndex == -1)
        curPreset.groups.push(group);
    /*else
      curPreset.splice(curGroupIndex, 1);*/
    }
    });
    $scope.selectedPreset = function()
    {
        return $scope.presets[$scope.presetIndex];
    }

    $scope.getGroupName = function(id) {
        if (id in $rootScope.groupHash)
            return $rootScope.groupHash[id].name;
        else
            return id;
    }

    GetPresets.then(function (data) {
        $scope.presets = data.data.presets;
    }); 
}
presetsCtrl.$inject = ["$scope","$rootScope", "GetPresets"];

function groupsCtrl ($scope, $rootScope, GetGroups) {
    $scope.selectedGroup = null;
    $scope.conectedGroups = [];
    $scope.groupList = [];
    $rootScope.groupHash = {};

    $scope.groupClicked = function (group) {
        $scope.selectedGroup = group;
        if (group == null) return;
        if ($rootScope.ctrlDown)       
            $rootScope.$broadcast('addGroupToPreset', group);
        else
            $rootScope.$broadcast('showGroupPreview', group);
    };

    var getGroupName = function(id) {
        if (id in $rootScope.groupHash)
            return $rootScope.groupHash[id].name;
        else
            return id;
    }

    var pushConnectedGroup = function (participantID) {
        var group = $rootScope.groupHash[participantID];
        $scope.conectedGroups.push(group);
        $scope.$apply();
    }

    var removeConnectedGroup = function (participantID) {
        var group = $rootScope.groupHash[participantID];
        $scope.conectedGroups.splice($scope.conectedGroups.indexOf(group), 1);
        $scope.$apply();
    }

    $scope.isGroupConected = function(group) {
        for (var i=0; i < $scope.conectedGroups.length; i++)
            if ($scope.conectedGroups[i].id == group.id)
                return true;
        return false;
    }

    $scope.isGroupDisconected = function(group) {
        return !($scope.isGroupConected(group));
    }
    
    GetGroups.then(function (data) {
        $scope.groupList = data.data.groups;
        for (var i=0; i < $scope.groupList.length; i++) {
            var group = $scope.groupList[i];
            $rootScope.groupHash[group.id] = group;
        }

        var nuveToken = $('body').data('nuve-token');

        $rootScope.room = Erizo.Room({token: nuveToken});

        $rootScope.participantElementIDs = {};

        $rootScope.room.addEventListener('room-connected', function (roomEvent) {
            for (var index in roomEvent.streams) {
                var stream = roomEvent.streams[index];
                pushConnectedGroup(stream.getAttributes().participantID);
            }   
        });

        $rootScope.room.addEventListener('stream-subscribed', function(streamEvent) {
            var participantID = streamEvent.stream.getAttributes().participantID;
            var elementID = $rootScope.participantElementIDs[participantID];
            streamEvent.stream.show(elementID, {speaker: false});
        });

        $rootScope.room.addEventListener('stream-added', function (streamEvent) {
            pushConnectedGroup(streamEvent.stream.getAttributes().participantID);
        });

        $rootScope.room.addEventListener('stream-removed', function (streamEvent) {
            var participantID = streamEvent.stream.getAttributes().participantID;
            removeConnectedGroup(participantID);
        });

        $rootScope.room.connect();

    }); 


}
groupsCtrl.$inject = ["$scope","$rootScope","GetGroups"];


function groupVideoCtrl ($scope, $rootScope) {
    $scope.videoId = '';
}
groupVideoCtrl.$inject = ["$scope","$rootScope"];

