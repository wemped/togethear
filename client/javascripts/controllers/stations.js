togethear_app.controller('StationController',function ($scope,StationFactory,$location,$routeParams){
    var my = this;
    var first_run = true;
    var sc_client_id = '28528ad11d2c88f57b45b52a5a0f2c83';
    var playing = false;
    var now_playing;
    var now_playing_info;
    var nextSong = function (){
        my.playlist.splice(0,1);
        playing = false;
        now_playing_info = my.playlist[0];
        now_playing.src = my.playlist[0].stream_url + "?client_id=28528ad11d2c88f57b45b52a5a0f2c83";
        now_playing.load();
        $scope.$apply();
        // my.sync_all(true);
        my.play(true);
    };
    my.stations = [];
    my.playlist = [];
    my.err = '';

    my.addTrack = function (){
        StationFactory.addTrack(my.trackUrl,function (results){
            if (results.err){
                my.err = results.err;
            }else{

            }
            my.trackUrl = '';
        });
    };
    my.play = function (next_song){
        if (playing){
            //nuthin
        }else if (now_playing){
            //add a listener at halfway through the song to sync_all
            var halfway = Math.ceil(0.5 * (now_playing_info.duration * 0.001));
            var sync_at_half = function (){
                var that = this;
                if(now_playing.currentTime >= halfway){
                    my.sync_all(false);
                    that.removeEventListener('timeupdate', sync_at_half,false);
                }
            };
            now_playing.addEventListener('ended',function (){ nextSong();});
            now_playing.addEventListener('timeupdate',sync_at_half);
            now_playing.play();
            console.log('sending sync_all to factory with next_song = ' + next_song);
            my.sync_all(next_song);
        }else{
            // now_playing.play();
        }
        playing = true;
    };
    my.pause = function (){
        if(playing){
            now_playing.pause();
        }
        playing = false;
    };
    my.request_stations = function (){
        StationFactory.request_stations( function (stations){
            my.stations = stations;
        });
    };
    //if station id is empty I'm requesting my own playlist
    my.request_playlist = function (){
        StationFactory.request_playlist();
    };
    my.update_playlist = function (new_playlist){
        my.playlist = new_playlist;
        if(first_run){
            my_station_initialize();
            first_run = false;
        }
        $scope.$apply();
    };
    my.sync_single = function (data){
        //just sync the song position
        var response = {};
        if(now_playing){
            response = {
                current_position : now_playing.currentTime,
                requester_socket_id : data.requester_socket_id
            };
        }else{
            response.err = 'not playing right now';
            //TODO
        }
        console.log('sending single response');
        socket.emit('/stations/sync_single_response',response);
    };

    my.sync_all = function (next_song){
        //sync playlist and current position and everything
        StationFactory.sync_all(my.playlist,now_playing.currentTime,next_song);
    };
    function my_station_initialize(){
        var elem = document.getElementById('audio');
        now_playing = elem;
        now_playing.src = my.playlist[0].stream_url + "?client_id=28528ad11d2c88f57b45b52a5a0f2c83";
        now_playing.load();
        // now_playing = elem;
        now_playing_info = my.playlist[0];
    }

    $scope.$on("$routeChangeSuccess", function ($currentRoute, $previousRoute){
        //get the playlist on view load
        // console.log($currentRoute);
        // console.log($previousRoute);
        console.log($location.path());
        if($location.path() === '/my_station'){
            console.log('in my_station');
            my.request_playlist();
            // my_station_initialize();
        }else{
            console.log('not in my_station');
            my.request_stations();
        }
    });

});