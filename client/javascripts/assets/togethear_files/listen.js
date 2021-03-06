togethear_app.factory('ListenFactory',function ($http){
    var factory = {};

    factory.get_station = function (station_id, callback){
        $http.post('/listens/get_station',{station_id : station_id}).then(function (response){
            callback(response.data);
        });
    };
    factory.request_sync = function (station_id,dj_socket_id){
        var data = {
            station_id : station_id,
            dj_socket_id : dj_socket_id
        };
        socket.emit('/listens/request_sync',data);
    };
    factory.join_station = function (station_id,dj_socket_id){
        socket.emit('/listens/join_station',{station_id : station_id,dj_socket_id : dj_socket_id});
    };
    factory.get_all_stations = function (callback){
        $http.get('/listens/all').then(function (response){
            callback(response.data);
            console.log(response);
        });
    };
    return factory;
});