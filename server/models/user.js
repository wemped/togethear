var mongoose = require('mongoose');
var UserSchema = new mongoose.Schema({
    username : String,
    password : String,
    station : {type : mongoose.Schema.Types.ObjectId, ref: 'Station'},
    about : String,
    // profile_img

});

mongoose.model('User',UserSchema);