var mongoose = require('mongoose');
var Station = mongoose.model('Station');
var User= mongoose.model('User');

module.exports = (function (){
    return {
        create : function (user_id,username,socket){
            var new_station = new Station();
            new_station.dj = user_id;
            new_station.dj_username = username;
            new_station.save(function (err,station){
                if (err){
                    console.log(err);
                    return null;
                }
                socket.request.session.station_id = station._id;
                User.findByIdAndUpdate(user_id,{"station" : station._id},
                                                     {safe : true,upsert : true, new : true},
                    function (err,user){
                        if (err){
                            console.log(err);
                        }
                    }
                );
            });
        },
        addTrack : function (data,socket,io){
            data.track.title = data.track.title;
            if (!data.track.streamable){
                return;
            }
            console.log(data);
            Station.findByIdAndUpdate(socket.request.session.station_id,
                                                      {$push : {playlist : data.track}},
                                                      {safe : true, upsert : true, new : true},
                function (err, station){
                    if (err){
                        console.log(err);
                        return;
                    }
                    io.emit ('playlist_update', {playlist : station.playlist});
                });
        },
        getPlaylist : function (socket,io){
            console.log('calling db...');
            console.log(socket.request.session.station_id);
            Station.findOne({_id : socket.request.session.station_id},function (err,station){
                if (err){
                    console.log(err);
                }else{
                    // console.log(station.playlist);
                    socket.emit('playlist_update', {playlist : station.playlist});
                }
            });
        },
        play : function (data,socket,io){

        },
        sync : function (data,socket,io){

        },
        all : function (req,res){

            var query = Station.find({}).select({"playlist" : 0});
            query.exec(function (err,stations){
                console.log(stations);
                res.json(stations);
            });
        }


    };
})();