var mongoose = require('mongoose');
var User = mongoose.model('User');
var Station = mongoose.model('Station');
var Stations = require('./stations.js');

module.exports = (function (){
    return {
        login : function(data,socket,io){
            User.findOne({username : data.username},function (err,user){
                var response = {};
                if (err){
                    console.log(err);
                    return;
                }
                if (user){
                    if (user.password === data.password){
                        console.log('password match');
                        socket.request.session.user_id = user._id;
                        socket.request.session.username = user.username;
                        socket.request.session.station_id = user.station;
                        // console.log(socket.request.session);
                        response.user = user;
                        //DJ JOIN ITS OWN ROOM?
                        //update the station to have the dj's socket id
                        console.log("socket id -> " + socket.id);
                        Station.findByIdAndUpdate(user.station,
                            {dj_socket_id : socket.id},{new:true,upsert:true,safe:true},
                            function (err,station){
                                if(err){
                                    console.log(err);
                                }else{
                                    console.log(station);
                                }
                            });
                    }else{
                        response.err = 'Incorrect password for that username';
                    }
                }else{
                    response.err = "We don't have that username on record..";
                }
                socket.emit('/users/login_response',response);
            });
        },
        register : function(data,socket,io){
            var new_user = new User(data);
            var response = {};
            new_user.save(function (err,user){
                if(err){
                    console.log(err);
                    response.err = "registration error";
                }else{
                    socket.request.session.user_id = user._id;
                    socket.request.session.username = user.username;
                    // console.log('calling stations.create');
                    Stations.create( user._id, user.username,socket);
                    response.user = user;
                    socket.emit('/users/login_response',response);
                }
            });
        }
    };
})();