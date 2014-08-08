function test(url) {
		alert(url);
		$('#monitor').html("<video src='"+url+"' autoplay=true />");

        //var streams = room.getStreamsByAttribute('participantID', 'shidur');
		//streams[0].show('monitor', {speaker: false});

        /*var scope = angular.element($("#monitor")).scope();
          scope.$apply(function(){
          scope.test();
          })*/
}

