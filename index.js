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

io.on('connection', function(socket) {
    socket.on('chat message', function(msg) {
        io.emit('chat message', msg);
    })
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});