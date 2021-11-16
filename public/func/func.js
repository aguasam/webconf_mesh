//da pra colocar em outro arquivo dps
function funcaoStats(dadosStats, peers){
	temp = new Object

	if (peers == 'socket_test'){
		 temp.userId=peers
		 temp.dados=dadosStats
	}else temp[peers] = dadosStats;
		
	 return temp
}

exports.funcaoStats = funcaoStats;