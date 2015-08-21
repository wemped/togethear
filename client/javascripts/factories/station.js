togethear_app.factory('StationFactory',function ($http){
    var factory = {};
    var sc_client_id = '28528ad11d2c88f57b45b52a5a0f2c83';
    var sc_resolve_url = "http://api.soundcloud.com/resolve.json?url=";
    var sc_client_url = "&client_id=" + sc_client_id;

    factory.toggleBroadcast = function (broadcasting,callback){
        console.log('sending broadcasting = ' + broadcasting);
        $http.post('/djs/toggleBroadcast', {broadcasting : broadcasting}).then( function(response){
            callback(response.data);
        });
    };
    factory.addPlaylistToCatalog = function (playlist_url,callback){
        var results = {};
        $http.get(sc_resolve_url + playlist_url + sc_client_url).then( function (response){
            var tracks = response.data.tracks;
            var len = tracks.length;
            var results= {};
            results.tracks = [];
            results.err = [];
            for (var i=0; i < len; i++){
                if(tracks[i].streamable){
                    tracks[i].track_source = 'soundcloud';
                    tracks[i].sc_id = tracks[i].id;
                    tracks[i].sc_user_id = tracks[i].user_id;
                    tracks[i].sc_user_url = tracks[i].user.permalink_url;
                    tracks[i].sc_username = tracks[i].user.username;
                    if (tracks[i].artwork_url){
                        console.log(tracks[i]);
                        tracks[i].artwork_url = tracks[i].artwork_url.replace('large','badge');
                    }
                    results.tracks.push(tracks[i]);
                    socket.emit('/djs/addTrackToCatalog',{track : tracks[i]});
                }else{
                    results.err.push(tracks[i]);
                }
            }
            callback(results);
        });
    };
    factory.addTrackToCatalog = function (track_url, callback){
        var results = {};
        $http.get(sc_resolve_url + track_url + sc_client_url).then( function (response){
            var track_info = response.data;
            if(track_info.streamable){
                track_info.track_source = 'soundcloud';
                track_info.sc_id = track_info.id;
                track_info.sc_user_id = track_info.user_id;
                track_info.sc_user_url = track_info.user.permalink_url;
                track_info.sc_username = track_info.user.username;
                if(track_info.artwork_url){
                    track_info.artwork_url = track_info.artwork_url.replace("large","badge");
                }
                console.log(track_info);
                results.new_track = track_info;
                socket.emit('/djs/addTrackToCatalog',{track : track_info});
            }else{
                results.err = 'This soundcloud user has set streaming to false for this track :/';
            }
            callback(results);
        });
    };
    factory.addTrackToPlaylist = function (track,callback){
        socket.emit('/djs/addTrackToPlaylist',{track : track});
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
    factory.get_my_station = function (callback){
        $http.get('/djs/get_my_station').then(function (response){
            callback(response.data);
        });
    };
    factory.request_stations = function (callback){
        $http.get('/stations').success(function (response){
            console.log(response);
            callback(response);
        });
    };
    factory.sync_all = function (playlist,current_position,next_song){
        var update = {
            next_song : next_song,
            playlist : playlist,
            current_position : current_position
        };
        socket.emit('/djs/sync_all',update);
    };
    factory.edit_station = function (new_title,description,artwork_url){
        $http.post('/djs/edit_station',{title : new_title, description : description, artwork_url : artwork_url});
    };
    return factory;
});