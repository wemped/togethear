var express = require('express');
var path = require('path');
var io = require('socket.io');

/*Start listening*/
var app = express();
var server = app.listen(8888);
console.log('listening on port 8888');

var sessionMiddleware = session({
    secret : 'TOGETHEAR 4EVR'
});

app.use(sessionMiddleware);
app.use(express.static(path.join(__dirname,'./client')));

io = io.listen(server);
io.use(function (socket,next){
    sessionMiddleware(socket.request, socket.request.res, next);
});

require('./config/routes.js')(app,io);