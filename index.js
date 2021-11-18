const {funcaoStats, funcClientsId, armazenaMensagem} = require('./public/func/func.js');
const express = require('express');
const server = express();
const app = express();
var http = require('http').Server(server); // Criando o servidor
const io = require('socket.io')(http);
//var fs = require('fs'); // Sistema de arquivos
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
/*
//Pegando um usuário específico da sala + suas stats.
server.get("/clients/:id", function(req,res){	
	
    let id = req.params; 
	let obj = funcClientsId(usuários, stats, id);
	if(obj == 0) return res.status(204).json();
	res.json(obj);

});
*/
/*
server.get("/clients", function(req,res){
    let obj = dados
	res.json(obj);
});
*/

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
    })

	socket.on('estatisticas', function(dados, userId) {
		peers = userId
		//dadosStats = dados
		stats.set(userId, dados)
		//funcaoStats(dadosStats, peers)
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
    socket.on("disconnect", function(){    //quando o usuario sai da pagina
        delete usuarios[socket.apelido];
        io.sockets.emit("atualizar usuarios", Object.keys(usuarios));
        io.sockets.emit("atualizar mensagens", " " + pegarDataAtual() + " " + socket.apelido + " saiu da sala");
      });
});
  
  function pegarDataAtual(){
    var dataAtual = new Date();
    var hora = (dataAtual.getHours()<10 ? '0' : '') + dataAtual.getHours();
    var minuto = (dataAtual.getMinutes()<10 ? '0' : '') + dataAtual.getMinutes();
    
   
    var dataFormatada =  hora + ":" + minuto;
    return dataFormatada;
   }
/*
// Função para guardar as mensagens e seu tipo na variável de ultimas mensagens
function armazenaMensagem(mensagem){
	if(ultimas_mensagens.length > 5){
		ultimas_mensagens.shift();
	}
	ultimas_mensagens.push(mensagem);
}
*/

/*
//da pra colocar em outro arquivo dps
function funcaoStats(dadosStats, peers){
	temp = new Object

	if (peers == 'socket_test'){
		 temp.userId=peers
		 temp.dados=dadosStats
	}
	 else {temp[peers] = dadosStats;
		
	 }
	 return temp
}
*/
