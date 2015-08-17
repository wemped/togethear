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
        socket.on('/stations/addTrack',function (data){
            Stations.addTrack(data,socket,io);
            // console.log(data);
        });
        socket.on('/stations/getPlaylist',function (){
            Stations.getPlaylist(socket,io);
        });
        socket.on('/stations/sync', function (data){
            console.log(data);
            Stations.sync(data);
        });
    });
    /*Http*/
    app.get('/stations',function (req,res){
        console.log('got get');
        Stations.all(req,res);
    });
});