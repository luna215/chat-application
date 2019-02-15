var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// loads index.html file
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

// loads style.css file
app.get('/style.css', function(req, res) {
    res.sendFile(__dirname + '/style.css');
})

app.get('/main.js', function(req, res) {
    res.sendFile(__dirname + '/main.js');
});

var numUsers = 0;

io.on('connection', function(socket) {
    var addUser = false;

    socket.on('add user', (username) => {
        if(addUser) return;

        // we store the username in the socket session for this client
        socket.username = username;
        ++numUsers; 
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });

        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });

    socket.on('chat message', function(msg) {
        io.emit('chat message', msg);
    })
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});