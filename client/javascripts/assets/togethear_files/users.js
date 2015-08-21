togethear_app.controller('UserController',function ($scope,UserFactory,$location,chatService){
    var my = this;
    my.chatService = chatService;
    my.messages = [];
    UserFactory.fetchSession(function (data) {
        my.chatService.user = data;
    });
    my.err = '';
    my.user_login_page = function (){
        $location.path('/login');
    };
    my.dj_login_page = function (){
        $location.path('/dj_login');
    }
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
            UserFactory.fetchSession(function (data) {
                my.chatService.user = data;
            });
            $location.path('/dashboard');
            my.err = '';
        }
        $scope.$apply();
    };
    my.chat = function (){
        if(my.newMessage.length > 0){
            UserFactory.chat(my.chatService.user, my.newMessage, my.chatService.station, function(data) {
                my.messages = data;
                my.newMessage = "";
            });
        }
    };
    my.new_message = function(msg) {
        UserFactory.new_message(msg, function(data) {
            my.messages = data;
        })
    }
});