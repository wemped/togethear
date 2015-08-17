togethear_app.controller('UserController',function ($scope,UserFactory,$location){
    var my = this;
    my.err = '';
    my.login = function (){
        UserFactory.login(my.log);
    };
    my.register = function (){
        UserFactory.register(my.reg);
    };
    my.login_answer = function(response){
        console.log(response);
        if (response.err){
            my.err = response.err;
        }else{
            $location.path('/dashboard');
            my.err = '';
        }
        $scope.$apply();
    };
});