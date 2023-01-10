const express = require('express');
const server = express();
const app = express();
const http = require('http').Server(server); // Creating the server
const io = require('socket.io')(http);
const usernames = new Map(); // Map for storing usernames
let messages = [];

server.use(express.static('public')); // Serve static files from the 'public' directory
app.use(express.json());

// Create the server
http.listen(3000, () => {
console.log('Server listening on port 3000');
});

// Handle GET request for the index.html file
server.get('/', function(req, res){
res.sendFile(__dirname + '/index.html');
});

// Handle socket connections
io.on('connection', function(socket) {
    // Notify all clients that a new user has joined the chat
socket.on('new user', function(username, callback){
    if(usernames.has(username)){
        callback(false);
    } else {
        callback(true);
        socket.username = username;
        usernames.set(username, socket);
        updateUsernames();
    }
});

// Send a message
socket.on('send message', function(message){
    messages.push({username: socket.username, message: message});
    io.sockets.emit('new message', {username: socket.username, message: message});
});

// Notify all clients when a user has disconnected
socket.on('disconnect', function(username){
    if(!socket.username) return;
    usernames.delete(socket.username);
    updateUsernames();
});

// Update the list of connected users
function updateUsernames(){
    io.sockets.emit('get users', Array.from(usernames.keys()));
}
});

module.exports = {
updateUsernames,
messages
}
