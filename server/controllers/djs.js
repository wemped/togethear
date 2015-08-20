var mongoose = require('mongoose');
var Station = mongoose.model('Station');
var User= mongoose.model('User');

module.exports = (function (){
    return {
        /*When a new user registers this creates a station for them*/
        create_station : function (user_id,username,socket){
            var new_station = new Station();
            new_station.dj = user_id;
            new_station.dj_username = username;
            new_station.dj_socket_id = socket.id;
            new_station.title = username + "'s Station";
            new_station.description = 'Enter a description';
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
        close_station : function (data,socket,io){
            station_id = socket.request.session.station_id;
            Station.findByIdAndUpdate(station_id,{open : false},
                                                        {safe : true,upsert : true, new : true},
                function (err, station){
                    if (err){
                        console.log(err);
                    }
                    console.log('CLOSED STATION!!!');
                    io.to(station_id).emit('/listens/dj_left');
                });
        },
        toggleBroadcast : function (req,res,io){
            station_id = req.session.station_id;
            var status = !req.body.broadcasting;
            Station.findByIdAndUpdate(station_id,
                                                      {open : status},
                                                      {safe : true, upsert : true, new : true},
                function (err,station){
                    if (err){
                        cosole.log(err);
                        return;
                    }
                    res.json({status : station.open});
                    if (!station.open){
                        io.to(station_id).emit('/listens/dj_left');
                    }
                });
        },
        /**/
        addTrackToCatalog : function(data,socket,io){
            station_id = socket.request.session.station_id;
            Station.findByIdAndUpdate(station_id,
                                          {$push : {catalog : data.track}},
                                          {safe : true,upsert : true, new : true},
                function (err,station){
                    if (err){
                        console.log(err);
                    }
                });
        },
        /**/
        addTrackToPlaylist : function(data,socket,io){
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
                    io.to(station_id).emit('/listens/playlist_update',{playlist : station.playlist, my_station : false, dj_socket_id : socket.id,station_id : station_id});
                });
        },
        get_my_station : function (req,res){
            Station.findById(req.session.station_id, function (err,station){
                if (err){
                    console.log(err);
                    return;
                }
                res.json(station);
            });
        },
        /*When a listener requests and sync, and the dj is replying it will be routed through here*/
        guide_sync_single : function (data,socket,io){
            io.to(data.requester_socket_id).emit('/listens/sync',data);
        },
        /**/
        sync_all_listeners : function (data,socket,io){
            station_id = socket.request.session.station_id;
            //dj calls this, station_id will be in the session
            //get room
            //update people in the room
            data.station_id = station_id;
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
                    });
                });
            }
        },
        edit_station : function (req,res){
            var station_id = req.session.station_id;
            var data = req.body;
            Station.findByIdAndUpdate(station_id,
                                                      {title : data.title, description : data.description, artwork_url : data.artwork_url},
                                                      {safe : true, upsert : true, new : true},
                function (err,station){
                    if (err){
                        console.log(err);
                    }
                }
            );
        }
    };
})();
/*Helper functions*/
function insert_and_pop(arr,max_len,val){
    if(arr.length < max_len){
        arr.push(val);
        return arr;
    }
    arr.splice(0,1);
    arr.push(val);
    return arr;
}