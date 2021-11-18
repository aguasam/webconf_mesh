/*/da pra colocar em outro arquivo dps
function funcaoStats(dadosStats, peers){
	temp = new Object

	if (peers == 'socket_test'){
		 temp.userId=peers
		 temp.dados=dadosStats
	}else {temp[peers] = dadosStats;}
	
     //console.log(dadosStats)
	 //console.log(temp[peers])
	 //console.log(temp)
	 return temp[peers]

}
exports.funcaoStats = funcaoStats;
*/

function funcaoStats(stats){

	let temp = new Map();
	console.log(stats)
	stats.forEach((stat, userId)=>{
		if (userId == 'socket_test')	temp.set(userId, stat)
		else temp[userId] = stat;
	})

	let obj = {
		'As estatísticas dos users são ': temp
	}

	if (!temp) return obj = 0;
	//console.log(temp)
	return temp
}
exports.funcaoStats = funcaoStats;
/*
//Aqui contem funções da parte de estatísticas do server.
function funcClients(usuários){
	let temp = new Map();
	usuários.forEach((socket, apelido)=>{
		if(socket.id) temp[apelido] = socket.id;
		//else temp[apelido] = socket;
		else temp.set(apelido, socket)
	})

	let obj = {
		'Os usuários na sala são': temp
	}
	if (!temp) return obj = 0;

	return temp
}
exports.funcClients = funcClients;
*/
// Função para guardar as mensagens e seu tipo na variável de ultimas mensagens
function armazenaMensagem(mensagem, ultimas_mensagens){
	if(ultimas_mensagens.length > 5){
		ultimas_mensagens.shift();
	}
	ultimas_mensagens.push(mensagem);

	return ultimas_mensagens
};
exports.armazenaMensagem = armazenaMensagem;