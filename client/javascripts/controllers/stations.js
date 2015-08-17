togethear_app.controller('StationController',function ($scope,StationFactory,$location){
    var my = this;
    var sc_client_id = '28528ad11d2c88f57b45b52a5a0f2c83';
    var playing = false;
    var now_playing;
    var now_playing_info;
    var nextSong = function (){
        my.playlist.splice(0,1);
        playing = false;
        now_playing = null;
        $scope.$apply();
        my.play();
    };
    my.stations = [];
    my.playlist = [];
    my.err = '';

    my.addTrack = function (){
        StationFactory.addTrack(my.trackUrl,function (results){
            if (results.err){
                my.err = results.err;
            }else{
                // my.playlist.push(results.new_track);
            }
            // $scope.$apply();
            my.trackUrl = '';
        });
    };
    my.play = function (){
        if (playing){
            //nuthin
        }else if (now_playing){
            now_playing.play();
            console.log(now_playing);
            sync();

        }else{
            StationFactory.getStream(my.playlist[0], function (results){
                var player = results.player;
                player._player._html5Audio.addEventListener('ended',function (){
                    nextSong();
                });
                player.play();
                now_playing = player;
                now_playing_info = my.playlist[0];
                console.log('now_playing ->');
                console.log(now_playing);
                sync();
            });
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
        console.log('requesting stations');
        StationFactory.request_stations( function (stations){
            //set scope stations to these
            console.log('stations ->');
            console.log(stations);
            my.stations = stations;
            // $scope.$apply();

        });
    };
    my.request_playlist = function (){
        console.log('requesting playlist');
        StationFactory.request_playlist();
    };
    my.update_playlist = function (new_playlist){
        console.log('in controller updating playlist');
        console.log(new_playlist);
        my.playlist = new_playlist.playlist;
        $scope.$apply();
    };
    my.request_playlist();
    my.request_stations();
    var sync = function (){
        StationFactory.sync(now_playing_info,now_playing._player._currentPosition);
    };
});