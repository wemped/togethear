//Require controllers
// var Stations = require('./../controllers/stations.js');
var Listens = require('./../controllers/listens.js');
var Djs = require('./../controllers/djs.js');
var Users = require('./../controllers/users.js');
module.exports = (function (app,io){
    /*Sockets*/
    io.sockets.on('connection', function(socket){
        console.log('CONNECTION session id -> ' + socket.request.session.id);
        /*USER ROUTES*/
        socket.on('/users/login',function (data){
            // socket.emit('login_success',data);
            Users.login(data,socket,io);
        });
        socket.on('/users/register',function (data){
            console.log(data);
            Users.register(data,socket,io);
        });
        socket.on('/users/chat', function (data){
            console.log('server message data: ',data);
            Users.chat(data,socket,io);
        });
        /*DJ ROUTES*/
        socket.on('/djs/create_station',function (data){
            console.log('got a create station');
            Djs.create(data,socket,io);
        });
        socket.on('/djs/addTrackToPlaylist',function (data){
            Djs.addTrackToPlaylist(data,socket,io);
            // console.log(data);
        });
        socket.on('/djs/addTrackToCatalog',function (data){
            Djs.addTrackToCatalog(data,socket,io);
        });
        socket.on('/djs/sync_single_response', function (data){
            Djs.guide_sync_single(data,socket,io);
        });
        socket.on('/djs/sync_all', function (data){
            Djs.sync_all_listeners(data,socket,io);
        });
        socket.on('disconnect', function (data){
            Djs.close_station(data,socket,io);
        });
        /*LISTENER ROUTES*/
        socket.on('/listens/getPlaylist',function (data){
            Listens.getPlaylist(data,socket,io);
        });
        socket.on('/listens/join_station', function (data){
            console.log(data);
            Listens.join_station(data,socket,io);
        });
        socket.on('/listens/request_sync', function (data){
            Listens.request_sync(data,socket,io);
        });
    });
    /*Http*/
    app.get('/listens/all',function (req,res){
        Listens.getAllStations(req,res);
    });
    app.post('/djs/toggleBroadcast', function (req,res){
        Djs.toggleBroadcast(req,res,io);
    });
    app.post('/djs/edit_station', function (req,res){
        Djs.edit_station(req,res);
    });
    app.get('/djs/get_my_station', function (req,res){
        Djs.get_my_station(req,res);
    });
    app.get('/session', function (req,res){
        res.json({name: req.session.username, _id: req.session.user_id});
    });
    app.post('/listens/get_station',function (req,res){
        Listens.getStation(req,res);
    });
});