//Require controllers
var Stations = require('./../controllers/stations.js');
var Users = require('./../controllers/users.js');
module.exports = (function (app,io){
    /*Sockets*/
    io.sockets.on('connection', function(socket){
        console.log('CONNECTION session id -> ' + socket.request.session.id);

        socket.on('/users/login',function (data){
            console.log(data);
            // socket.emit('login_success',data);
            Users.login(data,socket,io);
        });
        socket.on('/users/register',function (data){
            console.log(data);
            Users.register(data,socket,io);
        });

        socket.on('/stations/create',function (data){
            console.log('got a create station');
            Stations.create(data,socket,io);
        });
        socket.on('/stations/play',function (data){
            console.log(data);
        });
        socket.on('/stations/addTrackToPlaylist',function (data){
            Stations.addTrackToPlaylist(data,socket,io);
            // console.log(data);
        });
        socket.on('/stations/addTrackToCatalog',function (data){
            Stations.addTrackToCatalog(data,socket,io);
        });
        socket.on('/stations/getPlaylist',function (data){
            Stations.getPlaylist(data,socket,io);
        });
        socket.on('/stations/sync', function (data){
            console.log(data);
            Stations.sync(data);
        });
        socket.on('/stations/join', function (data){
            console.log(data);
            Stations.join(data,socket,io);
        });
        socket.on('/stations/sync_single_response', function (data){
            Stations.guide_sync_single(data,socket,io);
        });
        socket.on('/stations/sync_all', function (data){
            Stations.sync_all(data,socket,io);
        });
        socket.on('/stations/client_request_sync', function (data){
            Stations.client_request_sync(data,socket,io);
        });
    });
    /*Http*/
    app.get('/stations',function (req,res){
        console.log('got get');
        Stations.all(req,res);
    });
});