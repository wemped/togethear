

module.exports = (function (app,io){
    /*Sockets*/
    io.sockets.on('connection', function(socket){
        console.log('CONNECTION session id -> ' + socket.request.session.id);

        socket.on('play',function (data){
            console.log(data);
        });
    });
});