webrtc.service('GetGroups', ['$http', function ($http) {
    return $http.get('/api/participants');
}]);

webrtc.service('GetPresets', ['$http', function ($http) {	
    return $http.get('/api/presets');
}]);
