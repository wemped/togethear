var mongoose = require('mongoose');
var StationSchema = new mongoose.Schema({
    dj : {type : mongoose.Schema.Types.ObjectId, ref: 'User'},
    dj_username : String,
    dj_socket_id : String,
    playlist : [{
        title : String,
        artwork_url : String,
        duration : Number,
        genre : String,
        sc_id : Number,
        permalink_url: String,
        purchase_url : String,
        stream_url : String,
        streamable : Boolean,
        tag_list: String,
        track_source : String,
        sc_user_id : Number,
        sc_username : String,
        sc_user_url : String
    }],
    title : String,
    description : String,
    artwork_url : String,
    most_recently_played : {
        title : String,
        artwork_url : String,
        duration : Number,
        genre : String,
        sc_id : Number,
        permalink_url: String,
        purchase_url : String,
        stream_url : String,
        streamable : Boolean,
        tag_list: String,
        sc_user_id : Number,
        sc_username : String,
        sc_user_url : String,
        //extras
        current_position : Number
    },
    created_at : {type: Date, default : new Date()}
});

mongoose.model('Station',StationSchema);