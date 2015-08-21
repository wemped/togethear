togethear_app.controller('ListenController', function ($scope, ListenFactory,$location,$routeParams,chatService){
    var my=this;
    var now_playing; //audio element
    var station_id = $routeParams.id;
    var dj_socket_id;
    var browsing_dj_socket_id; //dj socket id when we are navigating stations we haven't joined
    var calibration_offsets = [];
    var local_position; //used for calibration song position

    my.chatService = chatService; //needed for sending/recieving messages
    my.now_playing_info = {};
    my.radio_info = {};
    my.browsing_playlist = []; //playlist when we are navigating stations we haven't joined
    my.playlist = []; //playlist for the station we are in
    my.offset = 100; //milisecond offset for song position
    my.all_stations = [];

    /*
        Shows footer player
        Stores new playlist
        Begins loading the first song
        ->in the server this will request an initial sync from the dj
        ->will be routed back here and call my.sync_initial
    */
    my.join_station = function (){
        $('#footer').css('visibility','visible').hide().fadeIn('slow');
        my.playlist = my.browsing_playlist;
        dj_socket_id = browsing_dj_socket_id;
        ListenFactory.join_station(station_id,dj_socket_id);
        my.chatService.station = station_id;
        my.chatService.dj_socket_id = dj_socket_id;
        if(my.playlist[0]){
            var elem = document.getElementById('audio');
            elem.src = my.playlist[0].stream_url + "?client_id=28528ad11d2c88f57b45b52a5a0f2c83";
            elem.load();
            elem.preload = true;
            now_playing = elem;
            my.now_playing_info = my.playlist[0];
        }
    };
    /*
        For the station page we are currently viewing
    */
    my.get_station = function (){
        ListenFactory.get_station(station_id, function (station){
            my.browsing_playlist = station.playlist;
            browsing_dj_socket_id = station.dj_socket_id;
            my.radio_info = {title: station.title, artwork: station.artwork_url, dj: station.dj_username};
            console.log(my.radio_info);
        });
    };
    /*
        Updates the playlist we are listening to
    */
    my.update_playlist = function (data){
        my.playlist = data.playlist;
        if(station_id === data.station_id){
            my.browsing_playlist = my.playlist;
        }
        my.now_playing_info = my.playlist[0];
        if (data.dj_socket_id){
            dj_socket_id = data.dj_socket_id;
        }
        $scope.$apply();
    };
    /*
        Requests a sync from the dj
        ->server sends request to dj, dj responds
        ->server routes that to me and I call my.sync
    */
    my.request_sync = function (){
        ListenFactory.request_sync(station_id,dj_socket_id);
    };
    /*
        Synchronizes the track position to the djs position
        Updates the playlist
        Changes to the next song if necessary
    */
    my.sync = function (data){
        now_playing = document.getElementById('audio');
        my.now_playing_info = my.playlist[0];
        if (data.playlist){
            my.playlist = data.playlist;
            //if we are looking at the playlist we are listening to..
            if (station_id === data.station_id){
                my.browsing_playlist = my.playlist;
            }
        }
        if(data.next_song){
            now_playing.src = my.playlist[0].stream_url + "?client_id=28528ad11d2c88f57b45b52a5a0f2c83";
            my.now_playing_info = my.playlist[0];
            var interval = my.now_playing_info.duration / 400000 ;
            var playbar_pos;
            var playbar = function(){
                playbar_pos = Math.round(now_playing.currentTime / interval) * 0.0025;
                line.animate(playbar_pos, {duration: 0});
            };
            now_playing.addEventListener('timeupdate',playbar);
            now_playing.play();
        }
        if(data.current_position){
            console.log('offset -> ' + my.offset);
            var dj_position = data.current_position + (my.offset * 0.001);
            var local_position = now_playing.currentTime;
            console.log('local_position -> ' + local_position + ' dj_position -> ' + dj_position);
            //if the djs position is more than 25ms off local position then reset
            if(Math.abs(dj_position - local_position) * 1000 > 25){
                now_playing.currentTime = dj_position;
                now_playing.play();
            }
            console.log('curr diff (ms)-> ' + ((dj_position - local_position) * 1000));
        }
        if(!my.now_playing_info.artwork_url){
            my.now_playing_info.artwork_url = '/javascripts/assets/no-image.jpg';
        }
        $scope.$apply();
    };
    /*
        Get all stations for the dashboard page
    */
    my.get_all_stations = function(){
        ListenFactory.get_all_stations(function (stations){
            my.all_stations = stations;
            // $scope.$apply();
            console.log(my.all_stations);
        });
    };
    /*
        Buffers the song until we have suffiecient amount to play
        ->Requests calibration with the dj
        ->This will be routed back and call my.calibrate
    */
    my.sync_initial = function (data){
        var interval = my.now_playing_info.duration / 400000 ;
        var playbar_pos;
        var playbar = function(){
            playbar_pos = Math.round(now_playing.currentTime / interval) * 0.0025;
            line.animate(playbar_pos, {duration: 0});
        };
        var on_progress = function(){
            var that=this;
            console.log("progress ? -> "  +now_playing.buffered.length);
            if(now_playing.buffered.length > 0){
                var need_buffered =data.current_position + ((now_playing.duration - data.current_position)/2);
                if(now_playing.buffered.end(now_playing.buffered.length-1) > need_buffered){
                    console.log("buffered.end -> " + now_playing.buffered.end(now_playing.buffered.length-1));
                    request_calibration();
                    that.removeEventListener('progress',on_progress,false);
                }
            }
        };
        now_playing.addEventListener('progress',on_progress);
        now_playing.addEventListener('timeupdate',playbar);
    };
    /*
        Averages the offsets from multiple calibration calls
        if the dj sends a final calibration message we update the offset
        *This actually just plays at the given offset right now*
    */
    my.calibrate = function (data){
        if(!local_position){
            local_position = data.current_position;
        }
        var dj_position = data.current_position;
        if (data.final){
            var offset_avg = 0;
            for (var i=0; i<calibration_offsets.length; i++){
                offset_avg += calibration_offsets[i];
            }
            offset_avg = offset_avg/calibration_offsets.length;
            now_playing.currentTime = data.current_position + (my.offset * 0.001);
            calibration_offsets = [];
            now_playing.play();
        }else{
            calibration_offsets.push(dj_position - local_position);
            now_playing.currentTime = dj_position;
        }
    };

    var request_calibration = function(){
        console.log('request_calibration');
        ListenFactory.request_sync(station_id,dj_socket_id, true);
    };
    $scope.$on("$routeChangeSuccess", function ($currentRoute, $previousRoute){
        station_id = $routeParams.id;
        if (station_id){
            my.get_station();
        }
        if($location.path() == '/dashboard'){
            my.get_all_stations();
        }
    });
});