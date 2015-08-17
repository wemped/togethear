togethear_app.factory('UserFactory', function(){
    var factory = {};

    factory.login = function (user){
        socket.emit('/users/login',user);
    };
    factory.register = function (user){
        socket.emit('/users/register',user);
    };

    return factory;
});