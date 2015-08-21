/*Make angular $location and $scope available*/
var $location = null;
var $user_scope = null;
var $station_scope = null;
angular.element(document).ready(function () {
   var app_elem = angular.element($('#togethear-app'));
   var user_controller_elem = angular.element($('#UserController'));
   var listen_controller_elem = angular.element($('#ListenController'));
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
});

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
      if(data.initial){
        $listen_scope.lC.sync_initial(data);
      }else{
        $listen_scope.lC.sync(data);
      }
    }
});
socket.on('/listens/sync_initial', function (data){
    var listen_controller_elem = angular.element($('#ListenController'));

  $listen_scope = listen_controller_elem.scope();
  if ($listen_scope){
    $listen_scope.lC.sync_initial(data);
  }
});
socket.on('/listens/calibration', function (data){
    var listen_controller_elem = angular.element($('#ListenController'));

  $listen_scope = listen_controller_elem.scope();
  if ($listen_scope){
    $listen_scope.lC.calibrate(data);
  }
});

socket.on('/stations/sync_single', function (data){
    var station_controller_elem = angular.element($('#StationController'));
    $station_scope = station_controller_elem.scope();
     if ($station_scope){
        $station_scope.sC.sync_single(data);
     }
});

socket.on('/stations/newMsg', function (data){
  var station_controller_elem = angular.element($('#StationController'));
  $station_scope = station_controller_elem.scope();
   if ($station_scope){
      $station_scope.sC.new_msg(data);
   }
});

socket.on('/stations/playlist_update', function (data){
    var station_controller_elem = angular.element($('#StationController'));
    $station_scope = station_controller_elem.scope();
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
socket.on('/listens/dj_left', function (data){
  console.log("CURRENT STATION CLOSED");
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

