var mongoose = require('mongoose');
var Station = mongoose.model('Station');
var User= mongoose.model('User');

module.exports = (function (){
    return {
        create : function (user_id,username,socket){
            var new_station = new Station();
            new_station.dj = user_id;
            new_station.dj_username = username;
            new_station.dj_socket_id = socket.id;
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
        addTrackToCatalog : function (data,socket,io){
            station_id = socket.request.session.station_id;
            Station.findByIdAndUpdate(station_id,
                                          {$push : {catalog : data.track}},
                                          {safe : true,upsert : true, new : true},
            function (err,station){
                // console.log(station.catalog);
            });
        },
        addTrackToPlaylist : function (data,socket,io){
            station_id = socket.request.session.station_id;
            if (!data.track.streamable){
                return;
            }
            Station.findByIdAndUpdate(socket.request.session.station_id,
                                                      {$push : {playlist : data.track}},
                                                      {safe : true, upsert : true, new : true},
                function (err, station){
                    if (err){
                        console.log(err);
                        return;
                    }
                    socket.emit ('/stations/playlist_update', {playlist : station.playlist, my_station : true});
                    io.to(station_id).emit('/listens/playlist_update',{playlist : station.playlist, my_station : false, dj_socket_id : socket.id});
                });
        },
        getPlaylist : function (data,socket,io){
            //if station id was passed in get that station, if not, get current user's station
            var station_id;
            var my_station = false;
            if (data.station_id){
                station_id = data.station_id;
            }else{
                station_id = socket.request.session.station_id;
                my_station = true;
            }
            Station.findOne({_id : station_id},function (err,station){
                if (err){
                    console.log(err);
                }else{
                    if(my_station){
                        socket.emit('/stations/playlist_update', {playlist : station.playlist, my_station : my_station, catalog : station.catalog});
                    }else{
                        socket.emit('/listens/playlist_update', {playlist : station.playlist, my_station : my_station, dj_socket_id : station.dj_socket_id});
                    }
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
                res.json(stations);
            });
        },
        join : function(data,socket,io){
            socket.join(data.station_id);
            //call the dj asking for its position
            Station.findOne({_id : data.station_id},function (err,station){
                if (err){
                    console.log(err);
                }else{
                    var data = {
                        requester_socket_id : socket.id
                    };
                    //the dj will respond and call guide_sync_single
                    io.to(station.dj_socket_id).emit('/stations/sync_single',data);
                }
            });

        },
        guide_sync_single : function (data,socket,io){
            io.to(data.requester_socket_id).emit('/listens/sync',data);
        },
        sync_all : function (data,socket,io){
            station_id = socket.request.session.station_id;
            //dj calls this, station_id will be in the session
            //get room
            //update people in the room
            io.to(station_id).emit('/listens/sync_all',data);
            //update db, if data.next_song is true, take old song
                //and put it in backlog
            if (data.next_song){
                Station.findById(station_id,function (err,station){
                    if (err){
                        console.log(err);
                        return;
                    }
                    var prev_song = station.playlist[0];
                    station.playlist.splice(0,1);
                    station.recently_played = insert_and_pop(station.recently_played,5,prev_song);
                    station.save(function (err,station){
                        if (err){
                            console.log(err);
                            return;
                        }
                        // console.log(station);
                    });
                });
            }else{

            }
        },
        client_request_sync : function (data,socket,io){
             data.requester_socket_id = socket.id;
             io.to(data.dj_socket_id).emit('/stations/sync_single',data);
        }
    };
})();

function insert_and_pop(arr,max_len,val){
    if(arr.length < max_len){
        arr.push(val);
        return arr;
    }
    arr.splice(0,1);
    arr.push(val);
    return arr;
}