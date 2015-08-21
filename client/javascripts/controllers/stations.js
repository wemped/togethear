togethear_app.controller('StationController',function ($scope,StationFactory,$location,$routeParams){
    var my = this;
    var broadcasting = false;
    var sc_client_id = '28528ad11d2c88f57b45b52a5a0f2c83';
    var playing = false;
    var now_playing;
    var now_playing_info;
    var nextSong = function (forced){
        my.playlist.splice(0,1);
        playing = false;
        now_playing_info = my.playlist[0];
        now_playing.src = my.playlist[0].stream_url + "?client_id=28528ad11d2c88f57b45b52a5a0f2c83";
        now_playing.load();
        if(!forced){
            $scope.$apply();
        }
        play(true);
    };

    my.messages = [];
    my.catalog = [];
    my.stations = [];
    my.playlist = [];
    my.err = '';
    my.station_title = '';
    my.station_description = '';
    my.station_artwork_url = '';

    /*
        Turns broadcasting on and off
    */
    my.toggleBroadcast = function(){
        play(false);
        StationFactory.toggleBroadcast(broadcasting,function (response){
            console.log(response);
            if (response.status){
                $('#toggleBroadcast').addClass('broadcasting');
                broadcasting = true;
            }else{
                $('#toggleBroadcast').removeClass('broadcasting');
                broadcasting = false;
                my.pause();
            }
        });
    };
    /*
    */
    my.next_song = function (){
        nextSong(true);
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
    /*
        If something isn't already playing it will load the next song and play
        ->this will send a sync to all listeners

    */
    var play = function (next_song){
        if (playing){
            //nuthin
        }else if (now_playing){
            //add a listener at halfway through the song to sync_all
            var halfway = Math.ceil(0.5 * (now_playing_info.duration * 0.001));
            var interval = now_playing_info.duration / 400000 ;
            var playbar_pos;
            $scope.showFooter = true;
            var sync_at_half = function (){
                var that = this;
                if(now_playing.currentTime >= halfway){
                    my.sync_all(false);
                    that.removeEventListener('timeupdate', sync_at_half,false);
                }
            };
            var playbar = function(){
                playbar_pos = Math.round(now_playing.currentTime / interval) * 0.0025;
                line.animate(playbar_pos, {duration: 0});
            };
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
    /*
        Pauses track on broadcast end
    */
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
    my.update_playlist = function (data){
        my.playlist = data.playlist;
        if (data.catalog){
            my.catalog = data.catalog;
        }
        $scope.$apply();
    };
    /*
        sends a sync when it was requested by a listener
        sends a calibration when it was requested by a listener
        sends initial sync when it was requested by a listener
    */
    my.sync_single = function (data){
        if (data.calibration){
            console.log('calibration is true!');
            var response = {};
            for (var i=0; i<1; i++){
                response = {
                    current_position : now_playing.currentTime,
                    requester_socket_id : data.requester_socket_id,
                    calibration : true
                };
                socket.emit('/listens/calibration',response);
            }
            response = {
                current_position : now_playing.currentTime,
                requester_socket_id : data.requester_socket_id,
                calibration : true,
                final : true
            };
            socket.emit('/listens/calibration',response);
        }else{
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
           if (data.joining){
               response.initial = true;
               socket.emit('/djs/sync_single_response',response);
           }else{
               socket.emit('/djs/sync_single_response',response);
           }
        }
    };

    my.sync_all = function (next_song){
        //sync playlist and current position and everything
        console.log(now_playing.currentTime);
        StationFactory.sync_all(my.playlist,now_playing.currentTime,next_song);
    };
    my.edit_title = function (){
        var new_title = prompt("Title for your station : ");
        if (new_title){
            StationFactory.edit_station(new_title,my.station_description,my.station_artwork_url);
            my.station_title = new_title;
        }
    };
    my.edit_description = function (){
        var new_description = prompt("Description for your station : ");
        if (new_description){
            StationFactory.edit_station(my.station_title,new_description,my.station_artwork_url);
            my.station_description = new_description;
        }
    };
    my.edit_artwork = function (){
        var new_artwork_url = prompt("Artwork URL for your station : ");
        if (new_artwork_url){
            StationFactory.edit_station(my.station_title, my.station_description, new_artwork_url);
            my.station_artwork_url = new_artwork_url;
        }
    };
    my.new_msg = function (data){
        console.log(data);
        my.messages.push(data);
    };
    var initialize_station = function (){
        StationFactory.get_my_station( function (station){
            console.log(station);
            my.playlist = station.playlist;
            my.catalog = station.catalog;
            my.station_title = station.title;
            my.station_description = station.description;
            my.station_artwork_url = station.artwork_url;
            if (my.playlist[0]){
                var elem = document.getElementById('audio');
                now_playing = elem;
                now_playing.src = my.playlist[0].stream_url + "?client_id=28528ad11d2c88f57b45b52a5a0f2c83";
                now_playing.load();
                now_playing_info = my.playlist[0];
            }
        });
    };

    $scope.$on("$routeChangeSuccess", function ($currentRoute, $previousRoute){
        if($location.path() === '/my_station'){
            initialize_station();
        }else{
            my.request_stations();
        }
    });
});