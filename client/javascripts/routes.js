/*Make angular $location and $scope available*/
var $location = null;
var $user_scope = null;
var $station_scope = null;
angular.element(document).ready(function () {
   var app_elem = angular.element($('#togethear-app'));
   var user_controller_elem = angular.element($('#UserController'));
   $location =  app_elem.injector().get('$location');
   $user_scope = user_controller_elem.scope().uC;
});

/*Socket Routes*/
var socket = io.connect();
socket.on('/users/login_response',function (data){
    $user_scope.login_answer(data);
});

socket.on('/users/newMsg',function (data){
  $user_scope.new_message(data);
})

socket.on('/listens/sync_all', function (data){
    var listen_controller_elem = angular.element($('#ListenController'));
    $listen_scope = listen_controller_elem.scope();
    if ($listen_scope){
      $listen_scope.lC.sync(data);
    }
});

socket.on('/listens/sync',function (data){
    var listen_controller_elem = angular.element($('#ListenController'));
    $listen_scope = listen_controller_elem.scope();
    if ($listen_scope){
        $listen_scope.lC.sync(data);
    }
});

socket.on('/stations/sync_single', function (data){
    //assumes this user is on his station page.
    var station_controller_elem = angular.element($('#StationController'));
    $station_scope = station_controller_elem.scope();
    //^^this has to be here because of page loading times
     if ($station_scope){
        $station_scope.sC.sync_single(data);
     }
});

socket.on('/stations/playlist_update', function (data){
  console.log('got a playlist update...');
    var station_controller_elem = angular.element($('#StationController'));
    $station_scope = station_controller_elem.scope();
    //^^this has to be here because of page loading times
     if ($station_scope){
        $station_scope.sC.update_playlist(data);
     }
});
socket.on('/listens/playlist_update', function (data){
    var listen_controller_elem = angular.element($('#ListenController'));
    $listen_scope = listen_controller_elem.scope();
    if ($listen_scope){
        $listen_scope.lC.update_playlist(data);
    }
});

/*Angular Routes*/
togethear_app.config(function ($routeProvider){
$routeProvider
    .when('/',{
        templateUrl : 'partials/splash.html'
    })
    .when('/login', {
      templateUrl : 'partials/login.html'
    })
    .when('/dj_login', {
      templateUrl : 'partials/dj_login.html'
    })
    .when('/dashboard',{
        templateUrl : 'partials/dashboard.html'
    })
    .when('/my_station',{
        templateUrl : 'partials/my_station.html'
    })
    .when('/station/:id',{
      templateUrl : 'partials/station.html'
    })
    .otherwise('/dashboard');
});

