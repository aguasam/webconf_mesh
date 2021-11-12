const express = require('express');
const server = express();
const app = express();
var http = require('http').Server(server); // Criando o servidor
const io = require('socket.io')(http);
var fs = require('fs'); // Sistema de arquivos
var stats = []


server.use(express.static('public'));
app.use(express.json());
/*
server.get("/stats", function(req,res){	
    let obj = funcaoStats(dadosStats,peers)
	res.json(obj);
});

server.get("/clients", function(req,res){
    let obj = dados
	res.json(obj);
});

http.listen(3000, () => {  //cria o servidor
    console.log('Server started at: 3000');
});

server.get('/', function(req, res){ //Pega o html e coloca no servidor
    res.sendFile(__dirname + '/index.html');
});
*/

http.listen(3000);

console.log("Aplicação está em execução...");

// Função principal de resposta as requisições do servidor
function resposta (req, res) {
    var arquivo = "";
    if(req.url == "/"){
        arquivo = dirname + '/index.html';
    }
    else if(req.url == "/estatisticas"){
        console.log("entrou aqui")
        //console.log(stats)
        arquivo = dirname + '/estat.html'
        //res.send(stats)
    }
    else{
        arquivo = __dirname + req.url;
    }
    fs.readFile(arquivo,
        function (err, data) {
            if (err) {
                res.writeHead(404);
                return res.end('Pagina ou arquivo nao encontrados');
            }

            res.writeHead(200);
            res.end(data);
        }
    );
}

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
		stats = dados
		funcaoStats(dadosStats, peers)
	})
/*
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
*/
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

//da pra colocar em outro arquivo dps
function funcaoStats(dadosStats, peers){
	temp = new Object

	if (peers == 'socket_test'){
		 temp.userId=peers
		 temp.dados=dadosStats
		// console.log("P: ", peers)
		// console.log("D: ", dadosStats)
	}
	 else {temp[peers] = dadosStats;
	   //  console.log(peers)
		
	 }
	 return temp
}
