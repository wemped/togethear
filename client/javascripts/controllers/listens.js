togethear_app.controller('ListenController', function ($scope, ListenFactory,$location,$routeParams){
    var now_playing;
    var now_playing_info;
    var last_updated_track_position;
    var station_id = $routeParams.id;

    var my=this;
    my.playlist = [];
    my.join_station = function (){
        //join room, get playlist
        ListenFactory.join_station(station_id);
    };
    my.request_playlist = function (station_id){
        //will run update_playlist asap
        ListenFactory.request_playlist(station_id);
    };
    my.update_playlist = function (new_playlist){
        //update playlist, set first song as the now_playing and begin loading
        my.playlist = new_playlist;
        var elem = document.getElementById('audio');
        elem.src = my.playlist[0].stream_url + "?client_id=28528ad11d2c88f57b45b52a5a0f2c83";
        elem.load();
        now_playing = elem;
        now_playing_info = my.playlist[0];
        $scope.$apply();
    };
    var request_sync = function (station_id){
        //will run sync asap
        ListenFactory.request_sync(station_id);
    };
    my.sync = function (data){
        //moves the now_playing song to correct time and plays
        if(data.current_position){
            last_updated_track_position = data.current_position;
            var seconds = Math.ceil(last_updated_track_position * 0.001);
            now_playing.currentTime = seconds;
            now_playing.play();
        }
    };
    $scope.$on("$routeChangeSuccess", function ($currentRoute, $previousRoute){
        //get the playlist on view load
        my.request_playlist(station_id);
    });
});