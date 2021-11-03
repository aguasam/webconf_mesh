const mediaStreamConstraints = {
    video: true
};
const offerOptions = {
    offerToReceiveVideo: 1,
};
const localVideo = document.getElementById('localVideo');
let localStream;
let localUserId;
let connections = [];

function gotRemoteStream(event, userId) {

    let remoteVideo  = document.createElement('video');

    remoteVideo.setAttribute('data-socket', userId);
    remoteVideo.srcObject   = event.stream;
    remoteVideo.autoplay    = true;
    remoteVideo.muted       = true;
    remoteVideo.playsinline = true;
    document.querySelector('.videos').appendChild(remoteVideo);
}

function gotIceCandidate(fromId, candidate) {
    connections[fromId].addIceCandidate(new RTCIceCandidate(candidate)).catch(handleError);
}

/*
function startLocalStream() {
    navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
        .then(getUserMediaSuccess)
        .then(connectSocketToSignaling).catch(handleError);
}
*/

function startLocalStream() {
    navigator.mediaDevices
    .getUserMedia({
      //audio: true,
      video: true
      //{ width: 800, height: 600 } -> Ja tive que especificar por causa do firefox.
    })
    .then((mediaStream) => {
      localStream = mediaStream;
      localVideo.srcObject = mediaStream;

      //emit("localStream", mediaStream);
      connectSocketToSignaling(mediaStream);
      console.log("Pegando userMedia com constraints:", {
        video: true,
        audio: true,
      });
    })
    .catch((e) => console.log("Error: ", e));
  
}

async function estatisticas(pc){
    
    pc.getStats(null).then(stats => {
        var statusOut = " ";

        stats.forEach(report => {
            if(report.type === "inbound-rtp"){
                Object.keys(report).forEach(statName => {
                    statusOut += `${statName}: ${report[statName]}\n`;
                })
            }
        })
        console.log(statusOut)
    })
};

function createPC(socket, localStream, userId){
    const pc = new RTCPeerConnection(mediaStreamConstraints);
    pc.onicecandidate = () => {
        if (event.candidate/* && (socket.id != userId)*/) {
            console.log(socket.id, ' Send Candidate to ', userId);
            socket.emit('candidate', { 
                toId: userId,
                candidate: event.candidate, 
            });
        }
    }

    connections[userId] = pc

    connections[userId].onaddstream = () => {
        gotRemoteStream(event, userId);
    };
    connections[userId].addStream(localStream);

    /////estatisticas/////   
    setInterval(() => {
        this.estatisticas(pc);
      },1000)
    
    return pc;
}

//connectSOcketToSignaling
function connectSocketToSignaling() {
    const socket = io.connect('http://localhost:3000', { secure: true });
    socket.on('connect', () => {
        localUserId = socket.id;
        console.log('localUser', localUserId);
        socket.on('user-joined', (data) => {
            const clients = data.clients;
            const joinedUserId = data.joinedUserId;
            console.log(joinedUserId, ' joined');
            const fromId = data.fromId;

            //como que configurou esse if
            userId = joinedUserId
            if(joinedUserId != localUserId){
                connections[userId] = createPC(socket, localStream, joinedUserId)
                connections[joinedUserId].createOffer(offerOptions).then((description) => {
                    connections[joinedUserId].setLocalDescription(description).then(() => {
                        console.log(socket.id, ' Send offer to ', joinedUserId);
                        socket.emit('offer', {
                            toId: joinedUserId,
                            description: connections[joinedUserId].localDescription,
                        });
                    }).catch(handleError);
                });
            }

            /////////saida/////////
            socket.on('user-left', (userId) => {
                let video = document.querySelector('[data-socket="'+ userId +'"]');
                video.parentNode.removeChild(video);
                //printa connection
                console.log(connections[userId] + ' left')
                //remove o connection
                delete connections[userId];
            });
            ////////////////////////
            socket.on('candidate', (data) => {
                const fromId = data.fromId;
                console.log(socket.id, ' Receive Candidate from ', fromId);
                if (data.candidate) {
                    gotIceCandidate(fromId, data.candidate);
                }
            });
            
            socket.on('offer', (data) => {
                const fromId = data.fromId;
                if (data.description) {
                    connections[fromId] = createPC(socket, localStream, userId)
                    console.log(socket.id, ' Receive offer from ', fromId);
                    connections[fromId].setRemoteDescription(new RTCSessionDescription(data.description))
                    connections[fromId].createAnswer()
                    .then((description) => {
                            return connections[fromId].setLocalDescription(description)
                    })
                    .then(() => {
                        console.log(socket.id, ' Send answer to ', fromId);
                        socket.emit('answer', {
                            toId: fromId,
                             description: connections[fromId].localDescription
                        });
                    })
                    .catch(handleError);
                }
            });

            socket.on('answer', (data) => {
                const fromId = data.fromId;
                console.log(socket.id, ' Receive answer from ', fromId);
                connections[fromId].setRemoteDescription(new RTCSessionDescription(data.description))
            });

        });
    })
}

/////END/////

function getUserMediaSuccess(mediaStream) {
    localStream = mediaStream;
    localVideo.srcObject = mediaStream;
}

function handleError(e) {
    //console.log(e);
    //alert('Something went wrong');
}


startLocalStream();

/*
//////cha webSocket/////
        // Ao enviar uma mensagem
		$("form#sala_chat").submit(function(e){
			e.preventDefault();

			var mensagem = $(this).find("#texto_mensagem").val();
			var usuario = $("#lista_usuarios").val(); // Usuário selecionado na lista lateral direita

			// Evento acionado no servidor para o envio da mensagem
			// junto com o nome do usuário selecionado da lista
			socket.emit("enviar mensagem", {msg: mensagem, usu: usuario}, function(){
				$("form#chat #texto_mensagem").val("");
			});
		});

		// Resposta ao envio de mensagens do servidor
		socket.on("atualizar mensagens", function(dados){
			var mensagem_formatada = $("<p />").text(dados.msg).addClass(dados.tipo);
			$("#historico_mensagens").append(mensagem_formatada);
		});

		$("form#login").submit(function(e){
			e.preventDefault();

			// Evento enviado quando o usuário insere um apelido
			socket.emit("entrar", $(this).find("#apelido").val(), function(valido){
				if(valido){
					// Caso não exista nenhum usuário com o mesmo nome, o painel principal é exibido
					$("#acesso_usuario").hide();
					$("#sala_chat").show();
                    $("conteudo_principal").show();
				}else{
					// Do contrário o campo de mensagens é limpo e é apresentado um alert
					$("#acesso_usuario").val("");
					alert("Nome já utilizado nesta sala");
				}
			});
		});

		// Quando servidor enviar uma nova lista de usuários
		// o select é limpo e reinserida a opção Todos
		// junto de toda a lista de usuários.
		socket.on("atualizar usuarios", function(usuarios){
			$("#lista_usuarios").empty();
			$("#lista_usuarios").append("<option value=''>Todos</option>");
				$.each(usuarios, function(indice){
					var opcao_usuario = $("<option />").text(usuarios[indice]);
					$("#lista_usuarios").append(opcao_usuario);
			});
		});
*/
