const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const WebRTC = require('./WebRTC');
const Statistics = require('./Statistics');
const Chat = require('./Chat');

const HOST = '0.0.0.0';
const PORT = 3000;

app.use(express.static(__dirname + '/public'));

server.listen(PORT, HOST, () => {
    console.log(`Server listening on http://${HOST}:${PORT}`);
});

app.get('/stats', (req, res) => {
    res.json(Statistics.stats);
});

io.on('connection', (socket) => {
    //Handling WebRTC connections
    socket.on('start-stream', () => {
        WebRTC.startLocalStream(socket);
    });

    socket.on('offer', (data) => {
        WebRTC.handleOffer(data, socket);
    });

    socket.on('answer', (data) => {
        WebRTC.handleAnswer(data);
    });

    socket.on('candidate', (data) => {
        WebRTC.handleCandidate(data);
    });

    //Handling Chat functionality
    socket.on('join', (username, callback) => {
        Chat.join(username, callback, socket);
    });

    socket.on('message', (data) => {
        Chat.handleMessage(data, socket);
    });

    socket.on('disconnect', () => {
        Chat.disconnect(socket);
    });

    //Tracking statistics
    Statistics.startTracking(socket);
});
