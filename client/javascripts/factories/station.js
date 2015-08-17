togethear_app.factory('StationFactory',function ($http){
    var factory = {};
    var sc_client_id = '28528ad11d2c88f57b45b52a5a0f2c83';
    var sc_resolve_url = "http://api.soundcloud.com/resolve.json?url=";
    var sc_client_url = "&client_id=" + sc_client_id;
    factory.create = function (callback){
        socket.emit('/stations/create');
    };
    factory.addTrack = function (track_url,callback){
        var results = {};
        // console.log('track url ->' + track_url);
        $http.get(sc_resolve_url + track_url + sc_client_url, function (track_info){
            if(track_info.streamable){
                //refine track_info object and save it into playlist,
                //then emit to server
                track_info.track_source = 'soundcloud';
                track_info.sc_id = track_info.id;
                track_info.sc_user_id = track_info.user_id;
                track_info.sc_user_url = track_info.user.permalink_url;
                track_info.sc_username = track_info.user.username;
                results.new_track = track_info;
                // console.log(track_info);

                socket.emit('/stations/addTrack',{track : track_info});
            }else{
                results.err = 'This soundcloud user has set streaming to false for this track :/';
            }
            callback(results);
        });
    };
    factory.getStream = function (track_info,callback){
        var smOptions = {
            useHTML5Audio:true,
            preferFlash :false
        };
        SC.stream('/tracks/' + track_info.sc_id, smOptions, function (player){
            var results = {};
             results.player = player;
            callback(results);
        });
    };
    factory.request_playlist = function (){
        console.log('emitting request..');
        socket.emit('/stations/getPlaylist',{});
    };
    factory.request_stations = function (callback){
        $http.get('/stations').success(function (response){
            callback(response);
        });
    };
    factory.sync = function (now_playing,current_position){
        var update = {
            track_info : now_playing,
            dj_position : current_position
        };
        socket.emit('/stations/sync',update);
    };
    // factory.request_sync = function ()

    return factory;
});