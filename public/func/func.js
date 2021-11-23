
function funcaoStats(stats){

	let temp = new Map();
	//console.log(stats)
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

// Função para guardar as mensagens e seu tipo na variável de ultimas mensagens
function armazenaMensagem(mensagem, ultimas_mensagens){
	if(ultimas_mensagens.length > 5){
		ultimas_mensagens.shift();
	}
	ultimas_mensagens.push(mensagem);

	return ultimas_mensagens
};
exports.armazenaMensagem = armazenaMensagem;

//funcao para pegar a hora atual para ser usada nas msg do chat
function pegarDataAtual(){
    var dataAtual = new Date();
    var hora = (dataAtual.getHours()<10 ? '0' : '') + dataAtual.getHours();
    var minuto = (dataAtual.getMinutes()<10 ? '0' : '') + dataAtual.getMinutes();
    
   
    var dataFormatada =  hora + ":" + minuto;
    return dataFormatada;
   };
exports.pegarDataAtual = pegarDataAtual;