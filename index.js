const {funcaoStats, pegarDataAtual, funcClientsId, armazenaMensagem} = require('./public/func/func.js');
const express = require('express');
const server = express();
const app = express();
const http = require('http').Server(server); // Criando o servidor
const io = require('socket.io')(http);
const usuarios = new Map();
const nomes = []
const stats = new Map();
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
        delete nomes[socket.apelido];
        usuarios.delete(socket.apelido); 
		stats.delete(socket.id);

        var mensagem = "[ " + pegarDataAtual() + " ] " + socket.apelido + " saiu da sala";
		var obj_mensagem = {msg: mensagem, tipo: 'sistema'};


		// No caso da saída de um usuário, a lista de usuários é atualizada
		// junto de um aviso em mensagem para os participantes da sala		
		io.sockets.emit("atualizar_usuarios", Object.keys(nomes));
		io.sockets.emit("atualizar_mensagens", obj_mensagem);

		armazenaMensagem(obj_mensagem, ultimas_mensagens);})

	socket.on('estatisticas', function(dados, userId) {
		peers = userId
		stats.set(userId, dados)
	})

    /////chat websocket/////
    socket.on("entrar", function(apelido, callback){
        if(!usuarios.get(apelido)){
			socket.apelido = apelido;
			nomes[apelido] = socket;			
			usuarios.set(apelido, socket); // Adicionando o nome de usuário a lista armazenada no servidor
			usuarios.forEach(i=>{obj = i})

			// Enviar para o usuário ingressante as ultimas mensagens armazenadas.
			for(indice in ultimas_mensagens){
				socket.emit("atualizar mensagens", ultimas_mensagens[indice]);
			}

			var mensagem = "[ " + pegarDataAtual() + " ] " + apelido + " acabou de entrar na sala";
			var obj_mensagem = {msg: mensagem, tipo: 'sistema'};

			io.sockets.emit("atualizar_usuarios", Object.keys(nomes)); // Enviando a nova lista de usuários
			io.sockets.emit("atualizar_mensagens", obj_mensagem); // Enviando mensagem anunciando entrada do novo usuário

			armazenaMensagem(obj_mensagem, ultimas_mensagens); // Guardando a mensagem na lista de histórico

			callback(true);
		}else{
			callback(false);
		}
    });
        
    socket.on("enviar_mensagem", function(dados, callback){  //envia a msg que irá pro historico de msg
        var mensagem_enviada = dados.msg;
		var usuario = dados.usu;
		if(usuario == null) usuario = ''; // Caso não tenha um usuário, a mensagem será enviada para todos da sala

		mensagem_enviada = "[ " + pegarDataAtual() + " ] " + socket.apelido + " diz: " + mensagem_enviada;
		var obj_mensagem = {msg: mensagem_enviada, tipo: ''};

		if(usuario == ''){
			io.sockets.emit("atualizar_mensagens", obj_mensagem);
			armazenaMensagem(obj_mensagem, ultimas_mensagens); // Armazenando a mensagem
		}else{
			obj_mensagem.tipo = 'privada';
			socket.emit("atualizar_mensagens", obj_mensagem); // Emitindo a mensagem para o usuário que a enviou
			usuarios.get(usuario).emit("atualizar_mensagens", obj_mensagem); // Emitindo a mensagem para o usuário escolhido
		}
		
		callback();
    });
});
  
  
