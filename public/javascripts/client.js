var socket = io();
var user;
var friend;

function login(){
	var username = document.getElementById("username").value;
	var password = document.getElementById("password").value;
	socket.emit('login',{
		username:username,
		password:password
	});
}

function signin(){
	var username = document.getElementById("tempUser").value;
	var password = document.getElementById("tempPass").value;
	var confirm = document.getElementById("confirm").value;
	if(password==confirm){
		socket.emit('addUser',{
			username:username,
			password:password
		});
	}else{
		document.getElementById("error-container").innerHTML="passwords did not match!!!";
	}
}

function startChatting(){
	socket.emit('startChatting',{
		username:user
	});
}

function sendChat(){
	socket.emit('msg',{
		username:user,
		friend:friend,
		msg:document.getElementById("currentChat").value
	});
	document.getElementById("currentChat").value="";
}

function selectedFriend(){
	var friends=document.getElementsByName('friend');
	for(var i=0;i<friends.length;i++){
		if(friends[i].checked){
			friend=friends[i].value;
			break;
		}
	}
	socket.emit('notifyFriend',{
		username:user,
		friend:friend,
		msg:user+":Are you free?"
	});
}

function halt(){
	socket.emit('signout',{
		username:user,
		friend:friend
	});
}


socket.on('userAlreadyPresent',function(data){
	document.getElementById("error-container").innerHTML="username already taken! try sth other";
});

socket.on('userAdded',function(data){
	document.getElementById("error-container").innerHTML='<a href="/">LOG IN</a>';
});


socket.on('authenticated',function(data){
	user=data.username;
	document.getElementById("Login").innerHTML="";
	document.getElementById("chatting").innerHTML='<div id="notifications"></div><div id="users"><fieldset>\
		<button onclick="startChatting()">users</button></fieldset></div>\
	<div id="chats"></div><div id="current"><fieldset>\
                <textarea id="currentChat" cols="80" rows="2"></textarea><br/>\
                <button id="postChat" onclick="sendChat()">SEND</button>\
        </fieldset></div>\
        <button onclick="halt()">LOG OUT</button>';
});

socket.on('unauthorised',function(data){
	document.getElementById("error-container").innerHTML="Invalid username/password";
});

socket.on('chooseUser',function(data){
	var str="<ul>";
	for(var user in data.users){
		if(!data.online[user])
			str+='<li style="color:#888;"><input type="radio" name="friend" value="'+user+'"/>'+user+'</li>';
		else{
			str+='<li style="color:#000fff;"><input type="radio" name="friend" value="'+user+'"/>'+user+'</li>';
		}
	}
	str+="</ul><br/>";
	str+='<button id="friendSelect" onclick="selectedFriend()">BEGIN</button>';
	document.getElementById("users").innerHTML=str;
});


socket.on('newMsg',function(data){
	if((data.username==user  && data.friend==friend) ||(data.username==friend && data.friend==user) ){
		document.getElementById("chats").innerHTML+="<p><b>"+data.username+"</b>:"+data.msg+"</p>";
	}
});

socket.on('friendOffline',function(data){
	if(user==data.username && friend==data.friend){
		document.getElementById("chats").innerHTML="YOUR FRIEND IS OFFLINE!!!";
	}
});


socket.on('checkUsers',function(data){
	var str="<ul>";
	for(var user in data.users){
		if(!data.online[user])
			str+='<li style="color:#888;"><input type="radio" name="friend" value="'+user+'"/>'+user+'</li>';
		else{
			str+='<li style="color:#000fff;"><input type="radio" name="friend" value="'+user+'"/>'+user+'</li>';
		}
	}
	str+="</ul><br/>";
	str+='<button id="friendSelect" onclick="selectedFriend()">BEGIN</button>';
	document.getElementById("users").innerHTML=str;
});

socket.on('notify',function(data){
	document.getElementById("notifications").innerHTML=data.msg;
});

socket.on('notifyParticular',function(data){
	if(data.friend==user){
		document.getElementById('notifications').innerHTML=data.msg;
	}
});


