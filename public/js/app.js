const express = require('express');
const server = express();
const http = require('http').Server(server);
const io = require('socket.io')(http);
const { startLocalStream, gotRemoteStream, gotIceCandidate, creatingOfferFunction } = require('./WebRTC');
const { startTrackingStatistics, stats } = require('./Statistics');
const { armazenaMensagem, pegarDataAtual } = require('./Chat');
const HOST = '0.0.0.0';
const PORT = 3000;
let nomes = []
let usuarios = new Map();
let ultimas_mensagens = [];

server.use(express.static('public'));

http.listen(PORT, HOST, () => {
    console.log(`Server listening on http://${HOST}:${PORT}`);
});

server.get("/stats", function(req, res) {
    res.json(stats);
});

server.get("/", function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on("connection", function(socket) {
    socket.on("start-stream", function() {
        startLocalStream(localStream, socket, gotRemoteStream, creatingOfferFunction);
    });

    socket.on("offer", function(data) {
        let connection = new RTCPeerConnection();
        connection.setRemoteDescription(new RTCSessionDescription(data.description));
        connection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("candidate", {
                    toId: data.fromId,
                    candidate: event.candidate
                });
            }
        };
        connection.ontrack = (event) => {
            gotRemoteStream(event, data.fromId);
        };
        connection.createAnswer()
            .then((description) => {
                connection.setLocalDescription(description);
                socket.emit("answer", {
                    toId: data.fromId,
                    description: connection.localDescription
                });
            })
            .catch(handleError);

        startTrackingStatistics(data.fromId, connection);
        connections.set(data.fromId, connection);
    });

    socket.on("candidate", function(data) {
        let connection = connections.get(data.fromId);
        connection.addIceCandidate(new RTCIceCandidate(data.candidate))
            .catch(handleError);
    });

    socket.on("answer", function(data) {
        let connection = connections.get(data.fromId);
        connection.setRemoteDescription(new RTCSessionDescription(data.description));
    });

    socket.on("entrar", function(apelido, callback) {
        if (!usuarios.get(apelido)) {
            socket.apelido = apelido;
            nomes[apelido] = socket;
            usuarios.set(apelido, socket);
            usuarios.forEach(i => {
                obj = i
            });
            for (let i in ultimas_mensagens) {
                socket.emit("atualizar mensagens", ultimas_mensagens[i]);
                }
                callback(true);
                var mensagem = "[ " + pegarDataAtual() + " ] " + socket.apelido + " entrou na sala";
                var obj_mensagem = { msg: mensagem, tipo: "sistema" };
        
                io.sockets.emit("atualizar_usuarios", Object.keys(nomes));
                io.sockets.emit("atualizar_mensagens", obj_mensagem);
                armazenaMensagem(obj_mensagem, ultimas_mensagens);
            } else {
                callback(false);
            }
        });
        
        socket.on("enviar_mensagem", function(mensagem) {
            var obj_mensagem = { msg: mensagem, tipo: "usuario" };
            var mensagem = "[ " + pegarDataAtual() + " ] " + socket.apelido + ": " + mensagem;
        
            io.sockets.emit("atualizar_mensagens", obj_mensagem);
            armazenaMensagem(obj_mensagem, ultimas_mensagens);
        });
        
        socket.on("disconnect", function() {
            delete nomes[socket.apelido];
            usuarios.delete(socket.apelido);
        
            var mensagem = "[ " + pegarDataAtual() + " ] " + socket.apelido + " saiu da sala";
            var obj_mensagem = { msg: mensagem, tipo: "sistema" };
        
            io.sockets.emit("atualizar_usuarios", Object.keys(nomes));
            io.sockets.emit("atualizar_mensagens", obj_mensagem);
            armazenaMensagem(obj_mensagem, ultimas_mensagens);
        });
        
    });

    // This is to handle the disconnection of a user when browser closes or refreshes
    window.onbeforeunload = function() {
    socket.emit("disconnect");
    }
    
    // This is to handle the disconnection of a user when browser closes or refreshes
    window.onunload = function() {
    socket.emit("disconnect");
    }
    
    // This is to handle the disconnection of a user when browser closes or refreshes
    window.onbeforeunload = function() {
    socket.emit("disconnect");
    }
    
    // This is to handle the disconnection of a user when browser closes or refreshes
    window.onunload = function() {
    socket.emit("disconnect");
    }
    
    
