/*Make angular $location and $scope available*/
var $location = null;
var $user_scope = null;
var $station_scope = null;
angular.element(document).ready(function () {
   var app_elem = angular.element($('#togethear-app'));
   var user_controller_elem = angular.element($('#UserController'));
   // var station_controller_elem = angular.element($('#StationController'));
   // console.log(user_controller_elem);
   // console.log(station_controller_elem);
   $location =  app_elem.injector().get('$location');
   $user_scope = user_controller_elem.scope().uC;
   // $station_scope = station_controller_elem.scope();
   // console.log($station_scope);
   // console.log($user_scope);
});

/*Angular Routes*/
togethear_app.config(function ($routeProvider){
$routeProvider
    .when('/',{
        templateUrl : 'partials/login.html'
    })
    .when('/dashboard',{
        templateUrl : 'partials/dashboard.html'
    })
    .when('/station',{
        templateUrl : 'partials/station.html'
    });
    // .otherwise('/dashboard');
});
/*Socket Routes*/
var socket = io.connect();
socket.on('login_response',function (data){
    $user_scope.login_answer(data);
});
socket.on('playlist_update', function (playlist){
   var station_controller_elem = angular.element($('#StationController'));
   $station_scope = station_controller_elem.scope();

    console.log('got a playlist_updated');
    console.log(playlist);
    if ($station_scope){
      $station_scope.sC.update_playlist(playlist);
    }
});
