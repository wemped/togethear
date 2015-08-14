/*Angular Routes*/
togethear_app.config(function ($routeProvider){
$routeProvider
    .when('/',{
        templateUrl : 'partials/station.html'
    });
});

/*SoundCloud initialization*/
SC.initialize({
    client_id : '28528ad11d2c88f57b45b52a5a0f2c83'
});





// console.log('initialize...');


// var player;

// var track_url = 'http://soundcloud.com/forss/flickermood';
// // SC.oEmbed(track_url, { auto_play: false }, function(oEmbed) {
// //     player = oEmbed;
// //     console.log('inside callback...oEmbed -> ');
// //     $('#sc_player').html(oEmbed.html);
// //     console.log(oEmbed);
// // });
// SC.whenStreamingReady(function() {
//     console.log('streaming is ready');
//     var track_info;
//     var now_playing;
//     trackUrl = prompt('enter soundcloud url');
//     // trackUrl = 'https://soundcloud.com/sigsounds-lakestreetdive/bad-self-portraits-2';
//     $.get('http://api.soundcloud.com/resolve.json?url=' + trackUrl + '&client_id=YOUR_CLIENT_ID', function (result){
//         track_info = result;
//         console.log(track_info);
//         console.log('retrieving sound..');
//         SC.stream('/tracks/' + track_info.id,function (sound){
//             console.log('playing');
//             sound.play();
//             now_playing = sound;
//             $('#button').click(function (e){
//                 console.log(now_playing._player);
//                 console.log(now_playing._player._currentPosition);
//             });
//         });

//     });


//     // var sound = SC.stream('/tracks/293');
//     // console.log(sound);
//     // sound.play();
//     // SC.get('/resolve/',)
// });