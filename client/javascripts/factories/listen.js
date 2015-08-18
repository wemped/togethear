togethear_app.factory('ListenFactory',function ($http){
    var factory = {};

    factory.request_playlist = function (station_id){
        socket.emit('/stations/getPlaylist',{station_id : station_id});
    };
    factory.request_sync = function (station_id,dj_socket_id){
        var data = {
            station_id : station_id,
            dj_socket_id : dj_socket_id
        };
        socket.emit('/stations/client_request_sync',data);
    };
    factory.join_station = function (station_id){
        socket.emit('/stations/join',{station_id : station_id});
    };
    return factory;
});