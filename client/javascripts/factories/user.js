togethear_app.factory('UserFactory', function(){
    var factory = {};

    factory.login = function (user,callback){
        socket.emit('/users/login',user);
        callback();
    };
    factory.register = function (user,callback){
        socket.emit('/users/register',user);
        callback();
    };

    return factory;
});