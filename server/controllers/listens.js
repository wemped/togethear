var mongoose = require('mongoose');
var Station = mongoose.model('Station');

module.exports = (function (){
    return {
        getStation : function(req,res){
            // console.log()
            var station_id = req.body.station_id;
            console.log('STATION ID -> ' + station_id);
            var query = Station.findById(station_id).select('dj dj_username dj_socket_id title description artwork_url playlist recently_played');
            query.exec(function (err,station){
                if (err){
                    console.log(err);
                    return;
                }

                var temp = [];
                if (station.playlist.length > 2){
                    temp = [station.playlist[0], station.playlist[1], station.playlist[2]];
                }else{
                    temp = station.playlist;
                }
                station.playlist=temp;
                res.json(station);
            });
        },

        /*Upon arriving at the main page, we should get neccessary information to show all the active stations*/
        getAllStations : function (req,res){
            var query = Station.find({open : true}).select('dj dj_username title description artwork_url playlist');
            query.exec(function (err,stations){
                for (var i=0; i<stations.length; i++){
                    if (stations[i].playlist[0]){
                        console.log('has a song');
                        stations[i].now_playing = stations[i].playlist[0];
                        stations.playlist = [];
                    }
                }
                res.json(stations);
            });
        },
        /*While on a station's page, we can click join, and then join the socket room and request a sync*/
        join_station : function(data,socket,io){
            console.log('sending dj sync_single with joining true');
            socket.join(data.station_id);
            var dj_socket_id = data.dj_socket_id;
            var info = {
                requester_socket_id : socket.id,
                joining : true
            };
            io.to(dj_socket_id).emit('/stations/sync_single',info);
        },
        /*While connected to a station, and the listener has requested a sync we need to pass that to the dj*/
        request_sync : function (data,socket,io){
            console.log('requesting sync with calibration = ' + data.calibration);
            data.requester_socket_id = socket.id;
            io.to(data.dj_socket_id).emit('/stations/sync_single',data);
        },
        guide_calibration : function(data,socket,io){
            console.log('guiding calibration');
            io.to(data.requester_socket_id).emit('/listens/calibration',data);
        }
    };
})();