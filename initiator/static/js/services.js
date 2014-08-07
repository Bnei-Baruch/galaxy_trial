webrtc.service('GetGroups', ['$http', function ($http) {
    return $http.get('/api/participants');
}]);

webrtc.service('GetPresets', ['$http', function ($http) {	
//    return $http.get('/api/presets');
    return $http.get('/static/json/presets.json');
}]);
