var http = require("http");
var fs = require("fs");
var mime = require("mime");
var path = require("path");
var cache={};
var users = {
	"lucky":"lucky",
	"jecky":"jecky",
	"vicky":"vicky"
}
var current={

};
var server = http.createServer(function(request,response){
	var filePath =false;
	if(request.url == '/'){
		filePath = 'public/login.html';
	}else{
		filePath = 'public/'+request.url;
	}
	var absPath = './'+filePath;
	serveStatic(response, cache, absPath);
});
var io = require("socket.io")(server);

function send404(response) {
	response.writeHead(404, {'Content-Type': 'text/plain'});
	response.write('Error 404: resource not found.');
	response.end();
}

function sendFile(response, filePath, fileContents) {
	response.writeHead(200,{
		"content-type": mime.lookup(path.basename(filePath))
	});
	response.end(fileContents);
}

function serveStatic(response, cache, absPath) {
	if (cache[absPath]) {
		sendFile(response, absPath, cache[absPath]);
	} else {
		fs.exists(absPath, function(exists) {
		if (exists) {
			fs.readFile(absPath, function(err, data) {
				if (err) {
					send404(response);
				} else {
					cache[absPath] = data;
					sendFile(response, absPath, data);
				}
		});
		} else {
		send404(response);
		}
		});
	}
}




io.on('connection',function(socket){
	
	socket.on('login',function(data){
		if(users[data.username]==data.password){
			socket.emit('authenticated',data);
				current[data.username]=true;
				io.sockets.emit("checkUsers",{
					users:users,
					online:current
				});
				io.sockets.emit('notify',{
					msg:data.username+" is online now!"
				});
		}else{
			socket.emit('unauthorised',data);
			console.log("sorry");
		}
	});

	socket.on('addUser',function(data){
		if(users[data.username]){
			socket.emit('userAlreadyPresent',data);
		}else{
			users[data.username]=data.password;
			socket.emit('userAdded',data);
		}
	});

	socket.on('notifyFriend',function(data){
		io.sockets.emit('notifyParticular',data);
	});

	socket.on('startChatting',function(data){
		socket.emit('chooseUser',{
			users:users,
			online:current
		});
	});

	socket.on('msg',function(data){
		io.sockets.emit('newMsg',data);
	});

	socket.on('signout',function(data){
		current[data.username]=false;
		io.sockets.emit('friendOffline',{
			username:data.friend,
			friend:data.username
		});
		io.sockets.emit("checkUsers",{
			users:users,
			online:current
		});

		io.sockets.emit('notify',{
			msg:data.username+" is offline now"
		});
	});



	socket.on('disconnect',function(){
		io.sockets.emit("checkUsers",{
			users:users,
			online:current
		});
	});
	
});

server.listen(3000,function(){
	console.log("server listening at port 3000");
});













