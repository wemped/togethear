togethear_app.controller('ListenController', function ($scope, ListenFactory,$location,$routeParams){
    var now_playing;
    var now_playing_info;
    var station_id = $routeParams.id;
    var first_run = true;

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
        if (first_run){
            var elem = document.getElementById('audio');
            elem.src = my.playlist[0].stream_url + "?client_id=28528ad11d2c88f57b45b52a5a0f2c83";
            elem.load();
            now_playing = elem;
            now_playing_info = my.playlist[0];
            var interval = now_playing_info.duration / 400000 ;
            var playbar_pos;
            var playbar = function(){
                var that = this;
                playbar_pos = Math.round(now_playing.currentTime / interval) * 0.0025;
                line.animate(playbar_pos, {duration: 0});
            }
            now_playing.addEventListener('timeupdate',playbar);
            first_run = false;
        }
        $scope.$apply();
    };
    var request_sync = function (station_id){
        //will run sync asap
        ListenFactory.request_sync(station_id);
    };
    my.sync = function (data){
        //moves the now_playing song to correct time and plays
        if (data.playlist){
            console.log('playlist exists in the data ->');
            console.log(data.playlist);
            my.playlist = data.playlist;
        }
        if(data.next_song){
            now_playing.src = my.playlist[0].stream_url + "?client_id=28528ad11d2c88f57b45b52a5a0f2c83";
            now_playing_info = my.playlist[0];
            now_playing.play();
        }else{
            if(data.current_position){
                var local_position = now_playing.currentTime;
                console.log('local_position -> ' + local_position);
                //if the djs position is more than 2 seconds off local position then reset
                if(data.current_position && Math.abs(data.current_position - local_position) > 1){
                    var seconds = data.current_position;
                    now_playing.currentTime = seconds;
                    now_playing.play();
                }
            }
        }
        $scope.$apply();
    };
    $scope.$on("$routeChangeSuccess", function ($currentRoute, $previousRoute){
        //get the playlist on view load
        my.request_playlist(station_id);
    });
});