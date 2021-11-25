const {funcaoStats, pegarDataAtual, funcClientsId, armazenaMensagem} = require('./public/func/func.js');
const express = require('express');
const server = express();
const app = express();
var http = require('http').Server(server); // Criando o servidor
const io = require('socket.io')(http);
var usuarios = new Map();
var stats = new Map();
let ultimas_mensagens = [];
const HOST = '0.0.0.0'

server.use(express.static('public'));
app.use(express.json());

server.get("/stats", function(req,res){	
    let obj = funcaoStats(stats)
	if(obj == 0) return res.status(204).json();
	res.json(obj);
});

//cria o servidor
http.listen(3000,HOST, () => {  
    console.log('O server ta na porta 3000');
});

//Pega o html e coloca no servidor
server.get('/', function(req, res){ 
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    /////voIP webRTC/////
	io.sockets.emit('user-joined', { clients:  Object.keys(io.sockets.clients().sockets), count: io.engine.clientsCount, joinedUserId: socket.id});
	
    socket.on('candidate', function(data) {
        io.to(data.toId).emit('candidate', { fromId: socket.id, ...data });
    });
    socket.on('offer', function(data) {
        io.to(data.toId).emit('offer', { fromId: socket.id, ...data });
    });

	socket.on("answer" , function(data){
        io.to(data.toId).emit('answer', { fromId: socket.id, ...data });
	})

    socket.on('disconnect', function() {
        io.sockets.emit('user-left', socket.id)
        delete usuarios[socket.apelido];
        usuarios.delete(socket.apelido); 
		stats.delete(socket.id);

        io.sockets.emit("atualizar usuarios", Object.keys(usuarios));
        io.sockets.emit("atualizar mensagens", " " + pegarDataAtual() + " " + socket.apelido + " saiu da sala");
    })

	socket.on('estatisticas', function(dados, userId) {
		peers = userId
		stats.set(userId, dados)
	})

    /////chat websocket/////
    socket.on("entrar", function(apelido, callback){
        if(!(apelido in usuarios)){
            socket.apelido = apelido; 
            usuarios[apelido] = socket;
            
            
            io.sockets.emit("atualizar usuarios", Object.keys(usuarios));  //atualiza o select para mostra o usurios
            io.sockets.emit("atualizar mensagens", " " + pegarDataAtual() + " " + apelido + " acabou de entrar na sala"); //mostra no historio a chegado do usurario
            io.sockets.emit("desc", " " + pegarDataAtual() + " " + apelido);
            callback(true);
        }else{
            callback(false);
        }
        });
        
    socket.on("enviar mensagem", function(mensagem_enviada, callback){  //envia a msg que irá pro historico de msg
        mensagem_enviada = " " + pegarDataAtual() + " " + socket.apelido+ ": " +  mensagem_enviada;
        io.sockets.emit("atualizar mensagens", mensagem_enviada);
        callback();
    });
});
  
  
