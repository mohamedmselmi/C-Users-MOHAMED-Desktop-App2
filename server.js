var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

users = [];
connections = [];

server.listen(process.env.PORT || 8000);
console.log('server running...');
app.get('/',function(req,res){
   res.sendFile(__dirname + '/index.html');


});


io.sockets.on('connection', function(socket){

    connections.push(socket);
    console.log('connected:%s sockets connected', connections.length);

    //disconnect
    socket.on('disconnect', function(data){
          if(!socket.username) return;
         delete users[socket.username];
        updateUsernames();
       console.log('user diconnected');
      
    });

    //send Message
    socket.on('chat message', function(data,callback){
          
        var msg = data.trim();
      
        if(msg.substr(0,3) ==='/w '){
            msg = msg.substr(3);
            var ind = msg.indexOf(' ');
            if(ind !== -1){
                var name= msg.substring(0, ind);
                var ss= socket.username.substring(0, ind);
                
                if(name in users){
                    users[name].emit('whisper', {msg: msg, user: socket.username});
                    users[socket.username].emit('whisper', {msg: msg, user: socket.username});
                    console.log('whisper!');
                }  else{
                    callback('Error: Enter a valid user')
                }
              
            }  else{
              callback('error ! please enter a message for your respear')
            }
          
        }else{
            io.emit('new message', {msg: data, user: socket.username});
    
        console.log(socket.username)
        }
        

      });

      socket.on('send-nickname', function(username) {
        socket.username = username;
        users.push(socket.username);
        console.log("dss"+users);
    });

     

    
      //New User
      socket.on('new user',function(data, callback){
         if(data in users){
             callback(false);
         } else{
            callback(true);
            socket.username = data;
            users[socket.username] = socket;
            updateUsernames();

         }
          
      });
      function updateUsernames(){
          io.sockets.emit('get users', Object.keys(users));
      }
});