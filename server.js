var express = require('express');
var path = require('path');
var io = require('socket.io');
var session = require('express-session');
var bodyParser = require('body-parser');

/*Start listening*/
var app = express();
var server = app.listen(8888);
console.log('listening on port 8888');

var sessionMiddleware = session({
    secret : 'TOGETHEAR 4EVR'
});

app.use(bodyParser.json());
app.use(sessionMiddleware);
app.use(express.static(path.join(__dirname,'./client')));

io = io.listen(server);
io.use(function (socket,next){
    sessionMiddleware(socket.request, socket.request.res, next);
});

require('./server/config/mongoose.js');
require('./server/config/routes.js')(app,io);