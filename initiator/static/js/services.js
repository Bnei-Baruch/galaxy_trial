webrtc.service('GetGroups', ['$http', function ($http) {
    // return $http.get('/api/groups');
    return $http.get('/static/json/groups.json');
}]);

webrtc.service('GetPresets', ['$http', function ($http) {	
//    return $http.get('/api/presets');
    return $http.get('/static/json/presets.json');
}]);
