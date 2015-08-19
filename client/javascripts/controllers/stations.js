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
        my.play(true);
    };

    my.catalog = [];
    my.stations = [];
    my.playlist = [];
    my.err = '';
    my.next_song = function (){
        console.log('next_song!');
        nextSong();
    };
    my.addPlaylistToCatalog = function (){
        StationFactory.addPlaylistToCatalog(my.playlistUrl,function(results){
            var len = results.tracks.length;
            for (var i=0; i<len; i++){
                my.catalog.push(results.tracks[i]);
            }
            len = results.err.length;
            for (var j=0; j<len; j++){
                my.err += "<p>Not streamable -- " + results.err[j].title + "</p>";
            }
        });
        my.playlistUrl = '';

    };
    my.addTrackToCatalog = function (){
        StationFactory.addTrackToCatalog(my.trackUrl,function (results){
            if(results.err){
                my.err = results.err;
            }else{
                my.catalog.push(results.new_track);
            }
            my.trackUrl = '';
        });
    };
    my.addTrackToPlaylist = function (track){
        StationFactory.addTrackToPlaylist(track);
    };
    my.play = function (next_song){
        if (playing){
            //nuthin
        }else if (now_playing){
            //add a listener at halfway through the song to sync_all
            var halfway = Math.ceil(0.5 * (now_playing_info.duration * 0.001));
            var interval = now_playing_info.duration / 400000 ;
            var playbar_pos;
            $scope.visibility = 'visible';
            var sync_at_half = function (){
                var that = this;
                if(now_playing.currentTime >= halfway){
                    my.sync_all(false);
                    that.removeEventListener('timeupdate', sync_at_half,false);
                }
            };
            console.log('interval: ',interval);
            var playbar = function(){
                playbar_pos = Math.round(now_playing.currentTime / interval) * 0.0025;
                line.animate(playbar_pos, {duration: 0});
            }
            now_playing.addEventListener('ended',function (){ nextSong();});
            now_playing.addEventListener('timeupdate',sync_at_half);
            now_playing.addEventListener('timeupdate',playbar);
            now_playing.play();
            console.log(now_playing.duration);
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
            console.log(now_playing.currentTime);
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
    my.update_playlist = function (data){
        my.playlist = data.playlist;
        if (data.catalog){
            my.catalog = data.catalog;
        }
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
        console.log(now_playing.currentTime);
        StationFactory.sync_all(my.playlist,now_playing.currentTime,next_song);
    };
    function my_station_initialize(){
        if( my.playlist[0] ){
            var elem = document.getElementById('audio');
            now_playing = elem;
            now_playing.src = my.playlist[0].stream_url + "?client_id=28528ad11d2c88f57b45b52a5a0f2c83";
            now_playing.load();
            // now_playing = elem;
            now_playing_info = my.playlist[0];
        }
    }

    $scope.$on("$routeChangeSuccess", function ($currentRoute, $previousRoute){
        //get the playlist on view load
        // console.log($currentRoute);
        // console.log($previousRoute);
        if($location.path() === '/my_station'){
            my.request_playlist();
            // my_station_initialize();
        }else{
            my.request_stations();
        }
    });

});