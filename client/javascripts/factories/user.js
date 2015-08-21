togethear_app.factory('UserFactory', function($http,chatService){
    var factory = {};
    var messages = [];
    var chat = chatService;

    factory.login = function (user){
        socket.emit('/users/login',user);
    };
    factory.register = function (user){
        socket.emit('/users/register',user);
    };
    factory.fetchSession = function(callback) {
		$http.get('/session').success(function(output) {
			user_info = output;
			callback(user_info);
		});
	};
    factory.chat = function(user, message, station, callback) {
        console.log('USER: ',user);
        messages.push({name: 'me', content: message});
        socket.emit('/users/chat', {name: user.name, content: message, station: station, user: user._id, dj_socket_id : chat.dj_socket_id});
        callback(messages);
    };
    factory.new_message = function(msg, callback) {
        console.log('message user  : ',msg.user);
        console.log('logged in user: ',chat.user._id);
        if(chat.user._id != msg.user){
            messages.push(msg);
        }
        callback(messages);
    };

    return factory;
});