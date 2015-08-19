togethear_app.controller('ListenController', function ($scope, ListenFactory,$location,$routeParams){
    var now_playing;
    var now_playing_info;
    var station_id = $routeParams.id;
    var dj_socket_id;
    var first_run = true;

    var my=this;
    my.playlist = [];
    my.offset = 0;
    my.join_station = function (){
        //join room, get playlist
        ListenFactory.join_station(station_id);
    };
    my.request_playlist = function (station_id){
        //will run update_playlist asap
        ListenFactory.request_playlist(station_id);
    };
    my.update_playlist = function (data){
        //update playlist, set first song as the now_playing and begin loading
        my.playlist = data.playlist;
        if (data.dj_socket_id){
            dj_socket_id = data.dj_socket_id;
        }
        if (first_run){
            if(my.playlist[0]){
                var elem = document.getElementById('audio');
                elem.src = my.playlist[0].stream_url + "?client_id=28528ad11d2c88f57b45b52a5a0f2c83";
                elem.load();
                now_playing = elem;
                now_playing_info = my.playlist[0];
                var interval = now_playing_info.duration / 400000 ;
                var playbar_pos;
                var playbar = function(){
                    playbar_pos = Math.round(now_playing.currentTime / interval) * 0.0025;
                    line.animate(playbar_pos, {duration: 0});
                }
            now_playing.addEventListener('timeupdate',playbar);
            }
            first_run = false;
        }
        $scope.$apply();
    };
    my.request_sync = function (){
        //will run sync asap
        console.log('calling request sync on factory');
        console.log('station_id -> ' + station_id);
        console.log('dj_socket_id' + dj_socket_id);
        ListenFactory.request_sync(station_id,dj_socket_id);
    };
    my.sync = function (data){
        //moves the now_playing song to correct time and plays
        if (data.playlist){
            my.playlist = data.playlist;
        }
        if(data.next_song){
            now_playing.src = my.playlist[0].stream_url + "?client_id=28528ad11d2c88f57b45b52a5a0f2c83";
            now_playing_info = my.playlist[0];
            now_playing.play();
        }else{
            if(data.current_position){
                console.log('offset -> ' + my.offset);
                var dj_position = data.current_position + (my.offset * 0.001);
                var local_position = now_playing.currentTime;
                console.log('local_position -> ' + local_position + ' dj_position -> ' + dj_position);
                console.log('diff (ms)-> ' + ((dj_position - local_position) * 1000));
                //if the djs position is more than 2 seconds off local position then reset
                if(Math.abs(dj_position - local_position) * 1000 > 300){
                    now_playing.currentTime = dj_position;
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