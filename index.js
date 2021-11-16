const {funcaoStats} = require('./public/func/func.js');
const express = require('express');
const server = express();
const app = express();
var http = require('http').Server(server); // Criando o servidor
const io = require('socket.io')(http);
//var fs = require('fs'); // Sistema de arquivos
var usuarios = [];
var stats = []
let ultimas_mensagens = [];
const HOST = '0.0.0.0'

server.use(express.static('public'));
app.use(express.json());

server.get("/stats", function(req,res){	
    let obj = funcaoStats(stats,peers)
	res.json(obj);
});
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
		dadosStats = dados
		stats = dados
		funcaoStats(dadosStats, peers)
	})

    /////chat websocket/////
    socket.on("entrar", function(apelido, callback){
		var mensagem = "[ " + pegarDataAtual() + " ] " + apelido + " acabou de entrar na sala";
		var obj_mensagem = {msg: mensagem, tipo: 'sistema'};

		if(!(apelido in usuarios)){
			socket.apelido = apelido;
			usuarios[apelido] = socket; // Adicionadno o nome de usuário a lista armazenada no servidor

			// Enviar para o usuário ingressante as ultimas mensagens armazenadas.
			for(indice in ultimas_mensagens){
				socket.emit("atualizar mensagens", ultimas_mensagens[indice]);
			}
			io.sockets.emit("atualizar usuarios", Object.keys(usuarios)); // Enviando a nova lista de usuários
			io.sockets.emit("atualizar mensagens", obj_mensagem); // Enviando mensagem anunciando entrada do novo usuário

			armazenaMensagem(obj_mensagem); // Guardando a mensagem na lista de histórico

			callback(true);
		}else{
			callback(false);
		}
	});


	socket.on("enviar mensagem", function(dados, callback){
		if(usuario == null)
			usuario = ''; // Caso não tenha um usuário, a mensagem será enviada para todos da sala
		
		var mensagem_enviada = dados.msg;
		mensagem_enviada = "[ " + pegarDataAtual() + " ] " + socket.apelido + " diz: " + mensagem_enviada;
		if(usuario == ''){
			io.sockets.emit("atualizar mensagens", obj_mensagem);
			armazenaMensagem(obj_mensagem); // Armazenando a mensagem
		}else{
			var usuario = dados.usu;
			var obj_mensagem = {msg: mensagem_enviada, tipo: ''};

			obj_mensagem.tipo = 'privada';
			socket.emit("atualizar mensagens", obj_mensagem); // Emitindo a mensagem para o usuário que a enviou
			usuarios[usuario].emit("atualizar mensagens", obj_mensagem); // Emitindo a mensagem para o usuário escolhido
		}
		callback();
	});

	socket.on("disconnect", function(){
		var mensagem = "[ " + pegarDataAtual() + " ] " + socket.apelido + " saiu da sala";
		var obj_mensagem = {msg: mensagem, tipo: 'sistema'};

		// No caso da saída de um usuário, a lista de usuários é atualizada
		// junto de um aviso em mensagem para os participantes da sala	
		delete usuarios[socket.apelido];
		io.sockets.emit("atualizar usuarios", Object.keys(usuarios));
		io.sockets.emit("atualizar mensagens", obj_mensagem);

		armazenaMensagem(obj_mensagem);
	});
});

// Função para apresentar uma String com a data e hora em formato DD/MM/AAAA HH:MM:SS
function pegarDataAtual(){
	var dataAtual = new Date();
	var hora = (dataAtual.getHours()<10 ? '0' : '') + dataAtual.getHours();
	var minuto = (dataAtual.getMinutes()<10 ? '0' : '') + dataAtual.getMinutes();
	var segundo = (dataAtual.getSeconds()<10 ? '0' : '') + dataAtual.getSeconds();

	var dataFormatada = hora + ":" + minuto + ":" + segundo;
	return dataFormatada;
}

// Função para guardar as mensagens e seu tipo na variável de ultimas mensagens
function armazenaMensagem(mensagem){
	if(ultimas_mensagens.length > 5){
		ultimas_mensagens.shift();
	}
	ultimas_mensagens.push(mensagem);
}

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
