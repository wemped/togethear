togethear_app.controller('ListenController', function ($scope, ListenFactory,$location,$routeParams,chatService){
    var my=this;
    var now_playing;
    var station_id = $routeParams.id;
    var dj_socket_id;
    var browsing_dj_socket_id;
    var first_run = true;
    // var calibration_dj_times = [];
    var calibration_offsets = [];
    var prev_postition;

    my.chatService = chatService;
    my.now_playing_info = {};
    my.browsing_playlist = [];
    my.playlist = [];
    my.offset = 0;
    my.all_stations = [];

    my.join_station = function (){
      //join room, get playlist
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
            now_playing = elem;
            my.now_playing_info = my.playlist[0];
            var interval = my.now_playing_info.duration / 400000 ;
            var playbar_pos;
            var playbar = function(){
                playbar_pos = Math.round(now_playing.currentTime / interval) * 0.0025;
                line.animate(playbar_pos, {duration: 0});
            };
            // now_playing.play();
        now_playing.addEventListener('timeupdate',playbar);
        }
        // $scope.$apply();
    };
    my.get_station = function (){
        ListenFactory.get_station(station_id, function (station){
            my.browsing_playlist = station.playlist;
            browsing_dj_socket_id = station.dj_socket_id;
        });
    };
    my.update_playlist = function (data){
        //update playlist, set first song as the now_playing and begin loading
        my.playlist = data.playlist;
        if(station_id === data.station_id){
            my.browsing_playlist = my.playlist;
        }
        my.now_playing_info = my.playlist[0];
        if (data.dj_socket_id){
            dj_socket_id = data.dj_socket_id;
        }
        if (first_run){

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
        now_playing = document.getElementById('audio');
        my.now_playing_info = my.playlist[0];

        //moves the now_playing song to correct time and plays
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
            // $scope.$apply();
            now_playing.play();
        }
        // console.log('next_song was false');
        if(data.current_position){
            console.log('offset -> ' + my.offset);
            var dj_position = data.current_position + (my.offset * 0.001);
            var local_position = now_playing.currentTime;
            console.log('local_position -> ' + local_position + ' dj_position -> ' + dj_position);
            //if the djs position is more than ---- off local position then reset
            if(Math.abs(dj_position - local_position) * 1000 > 300){
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
    my.get_all_stations = function(){
        ListenFactory.get_all_stations(function (stations){
            my.all_stations = stations;
            // $scope.$apply();
            console.log(my.all_stations);
        });
    };
    my.sync_initial = function (data){
        var buffered_to = now_playing.buffered.end(now_playing.length - 1);
        if (buffered_to < data.current_position){
            console.log('Still buffering...');
            //pause
            //check if buffered
        setTimeout(my.sync_initial(data), 200);
            // buffered_to = now_playing.buffered.end(now_playing.length -1);
        }else{
            request_calibration();
        }
    };
    var request_calibration = function(){

        ListenFactory.request_sync(station_id,dj_socket_id, true);
    };
    my.calibrate = function (data){
        if (data.final){
            var offset_avg = 0;
            for (var i=0; i<calibration_offsets.length; i++){
                offset_avg += calibration_offsets[i];
            }
            offset_avg = offset_avg/calibration_offsets.length;
            my.offset = offset_avg;
            now_playing.currentTime = data.current_position + my.offset;
            prev_postition = null;
            calibration_offsets = [];
        }else{
            if (!prev_postition){
                prev_postition = data.current_position;
            }
            // calibration_times.push(data.current_position);
            calibration_offsets.push(data.current_position - prev_postition);
            now_playing.currentTime = data.current_position;
            prev_postition = now_playing.currentTime;
        }
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