togethear_app.controller('StationController',function ($scope){
    var my = this;
    var sc_client_id = '28528ad11d2c88f57b45b52a5a0f2c83';
    var playing = false;
    var now_playing;
    var nextSong = function (){
        my.playlist.splice(0,1);
        playing = false;
        now_playing = null;
        $scope.$apply();
        my.play();
    };
    var smOptions = {
        useHTML5Audio:true,
        preferFlash :false
    };

    my.playlist = [];
    my.err = '';

    my.addTrack = function (){
        //get info on the track, and if streamable add to playlist
        $.get('http://api.soundcloud.com/resolve.json?url='+
                    my.trackUrl+'&client_id='+sc_client_id,
                 function (response){
                    if(response.streamable){
                        my.err = '';
                        my.playlist.push(response);
                    }else{
                        my.err = 'This soundcloud user has set streaming to false for this track :/';
                    }
                    $scope.$apply();//Need this to update html
                 });
        my.trackUrl = '';
    };
    my.play = function (){
        if (playing){
            //nuthin
        }else if (now_playing){
            now_playing.play();
        }else{
            // console.log(my.playlist);
            // console.log('getting sound from -> ' + '/tracks/' + my.playlist[0].id);
            //Get the stream and play it
            SC.stream('/tracks/' + my.playlist[0].id,smOptions, function (sound){
                var soundplayer= sound;
                var html5Audio = sound._player._html5Audio;
                html5Audio.addEventListener('ended', function(){
                    nextSong();
                });
                // console.log('got sound - playing...');
                sound.play();
                now_playing = sound;
            });
        }
        playing = true;
    };
    my.pause = function (){
        if(playing){
            now_playing.pause();
        }
        playing = false;
    };
    my.gotoend = function (){
        console.log(now_playing);
        now_playing.seek('track??',170000);
        now_playing.play();
    };
});