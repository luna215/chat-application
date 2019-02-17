var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

http.listen(port, () => {
    console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

var numUsers = 0;
var users = [];

io.on('connection', function(socket) {
    var addedUser = false;

    socket.on('add user', (username) => {
        if(addedUser) return;

        // we store the username in the socket session for this client
        socket.username = username;
        if(users.includes(socket.username)){
            socket.emit('user already exist', {
                message: 'User already exists. Choose another name.',
            });
        } else {
            users.push(socket.username);
            ++numUsers;
            addedUser = true;
            socket.emit('login', {
                numUsers: numUsers,
            });
            // echo globally (all clients) that a person has connected
            socket.broadcast.emit('user joined', {
                username: socket.username,
                numUsers: numUsers
            });
        }

    });

    // when the client emits 'new message', this listens and executes
  socket.on('new message', (data) => {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  socket.on('typing', () => {
    socket.broadcast.emit('typing', {
        username: socket.username,
    });
  });

  socket.on('stop typing', () => {
      socket.broadcast.emit('stop typing', {
          username: socket.username
      });
  });

  // when a user leaves
  socket.on('disconnect', () => {
    if(addedUser) {
        --numUsers;

        // Remove username from the list of users
        users = users.filter((username) => username !== socket.username);

        // echo globally that a user has left
        socket.broadcast.emit('user left', {
            username: socket.username,
            numUsers: numUsers
        });
    }
  });
});

