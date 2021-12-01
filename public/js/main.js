const mediaStreamConstraints = {
    video: true
};
const offerOptions = {
    offerToReceiveVideo: 1,
};
const localVideo = document.getElementById('localVideo');
let localStream;
let localUserId;
let connections = new Map();
let remoteStreams = new Map();


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
    connections.get(fromId)
    .addIceCandidate(new RTCIceCandidate(candidate)).catch(handleError);
}

function startLocalStream() {
    navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: true
      //{ width: 800, height: 600 } -> Ja tive que especificar por causa do firefox.
    })
    .then((mediaStream) => {
      localStream = mediaStream;
      localVideo.srcObject = mediaStream;

      connectSocketToSignaling(mediaStream);
    })
    .catch((e) => console.log("Error: ", e));
  
}

async function creatingOfferFunction(pc, joinedUserId, socket){
    let description = await pc.createOffer();

    await pc.setLocalDescription(description);
    
    console.log(socket.id, " Send offer to ", joinedUserId);
    socket.emit("offer", {
      type: "offer",
      toId: joinedUserId,
      description: pc.localDescription,  
    });
  };

function estatisticas(socket, pc){
    pc.getStats(null).then(stats => {
        var statusOut = new Object;
        var statusIn = {
            packetsLost: 0,
            packetsReceived: 0, 
            packetsSent: 0,
            bytesSent: 0,
            bytesReceived: 0,
            dataChannelsOpened: 0,
            dataChannelsClosed: 0,
            remoteCandidateId: null,
            localCandidateId: null,
            totalEncodeTime: 0, 
      
        };

        stats.forEach(report => {
            if(report.type === "inbound-rtp"){
                statusOut.packetsLost = report.packetsLost - statusIn.packetsLost
                statusIn.packetsLost = report.packetsLost
            }
            if ( report.type == "transport" ){
                let rpr = report.packetsReceived;
                let rps = report.packetsSent;
                let rbs = report.bytesSent;
                let rbr = report.bytesReceived;
                
                statusOut.packetsReceived = rpr - statusIn.packetsReceived;
                statusOut.packetsSent = rps - statusIn.packetsSent;
                statusOut.bytesSent = rbs - statusIn.bytesSent;
                statusOut.bytesReceived =rbr - statusIn.bytesReceived;

                statusIn.packetsReceived = rpr;
                statusIn.packetsSent = rps;
                statusIn.bytesSent = rbs;
                statusIn.bytesReceived = rbr;
            } 
            if(report.type == "peer-connection"){
                statusOut.dataChannelsOpened = report.dataChannelsOpened;
                statusOut.dataChannelsClosed = report.dataChannelsClosed;
            }
            if(report.type == "candidate-pair"){
                statusOut.localCandidateId = report.localCandidateId;
                statusOut.remoteCandidateId = report.remoteCandidateId;
            }
            if(report.type == "outbound-rtp"){
                statusOut.totalEncodeTime = report.totalEncodeTime;
            }
        })
        //console.log(statusOut)
        socket.emit('estatisticas', statusOut, socket.id)
    })
};

function createPC(socket, userId, mediaStream){
    const pc = new RTCPeerConnection(mediaStreamConstraints);
    let track = 0;

    pc.onicecandidate = () => {
      if (event.candidate) {
        console.log(socket.id, ' Send Candidate to ', userId);
        socket.emit('candidate', {
        toId: userId,
        candidate: event.candidate,
        });
      }
    }
/*
    pc.ontrack = (evt) => {
        // add the first track to my corresponding user.
        const remoteStream = remoteStreams.get(userId);
        if (remoteStream) {
          remoteStream.addTrack(evt.track);
          track = 1;
        }
        
        // add the second track to my corresponding user.
        else {
          const remoteStream = new MediaStream;
          emit("remoteStream", { stream: remoteStream, id: userId });
          remoteStream.addTrack(evt.track);
          remoteStreams.set(userId, remoteStream);
  
        }
      };
  
      // track receives objects of type MediaStreamTrack from the returned array
      // by .getTracks. This addTrack function "calls" onTrack.
      for (const track of mediaStream.getTracks()) {
        pc.addTrack(track);
      }
*/
    pc.onaddstream = () => {
        gotRemoteStream(event, userId);
    };
    pc.addStream(mediaStream);

    connections.set(userId, pc);

    /////estats/////
    setInterval(() => {
        this.estatisticas(socket, pc);
      },1000)
    ///////////////
    return pc;
}

//connectSOcketToSignaling
function connectSocketToSignaling(mediaStream) {
    const socket = io.connect('http://localhost:3000', { secure: true });

    ////////////////////////////////////////////////////////////////////////////
    socket.on('connect', () => {
    localUserId = socket.id;
    console.log('localUser', localUserId);
    
        socket.on('user-joined', (data) => {
            const joinedUserId = data.joinedUserId;
            console.log(joinedUserId, ' joined');

            const userId = joinedUserId

            if (userId != socket.id) {
            
                const pc = createPC(socket, joinedUserId, localStream);

                connections.set(userId, pc);

                creatingOfferFunction(connections.get(userId) , joinedUserId, socket);
            }

        });

        socket.on('user-left', (userId) => {
            remoteStreams.delete(userId.id);
            
            if(document.querySelector('[data-socket="'+ userId +'"]')){
                let video = document.querySelector('[data-socket="'+ userId +'"]');
                video.parentNode.removeChild(video);
            }
            
            if (userId == socket.id){
                connections.forEach(user => {
                    connections.delete(user);
                })
            }else connections.delete(userId);

            console.log(userId + ' left')
        });

        socket.on('candidate', (data) => {
            const fromId = data.fromId;
            console.log(socket.id, ' Receive Candidate from ', fromId);

            if (data.candidate) {
                gotIceCandidate(fromId, data.candidate);
            }
        });
        
        socket.on('offer', (data) => {
            const fromId = data.fromId;
            //userId = socket.id
            if (data.description) {
                connections.set(fromId, createPC(socket,  fromId, localStream));

                const connection = connections.get(fromId);
                console.log(socket.id, " Receive offer from ", fromId);
                connection.setRemoteDescription(
                    new RTCSessionDescription(data.description)
                );

                connection.createAnswer()
                .then((description) => {
                    return connection.setLocalDescription(description);
                })
                .then(() => {
                    socket.emit("answer", {
                    toId: fromId,
                    description: connection.localDescription,
                    });
                })
                .catch((e) => console.log("Error: ", e));
                }
            });
            
        socket.on('answer', (data) => {
            const fromId = data.fromId;
            console.log(socket.id, ' Receive answer from ', fromId);
            const connection = connections.get(fromId);
            
            connection
            .setRemoteDescription(new RTCSessionDescription(data.description))
            .catch((e) => console.log("Error: ", e));
        });
    })
    /////////////////////////////////////////////////////////////////////////////////////

    var form = document.getElementById("chat");
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        var mensagem = document.getElementById("texto_mensagem").value;
        var usuário = document.getElementById("lista_usuarios").value; // Usuário selecionado na lista lateral direita

        // Evento acionado no servidor para o envio da mensagem
        // junto com o nome do usuário selecionado da lista
        socket.emit( "enviar_mensagem", { msg: mensagem, usu: usuário }, () => {
            document.getElementById("texto_mensagem").value = "";
        });
    });
    
    socket.on("atualizar_mensagens", function(dados){    //Pega a msg escrita e mandar para o idex.js para madar pro historico
        var mensagem_formatada = document.createElement("p");

        //Definindo a classificação da mensagem.
        if (dados.tipo == "sistema") mensagem_formatada.setAttribute("class", "sistema");
        else mensagem_formatada.setAttribute("class", "privada");

        //add msg para o paragrafo.
        mensagem_formatada.appendChild(document.createTextNode(dados.msg));

        //add novo paragrafo com msg para o histórico.
        var historico = document.getElementById("historico_mensagens");
        historico.appendChild(mensagem_formatada);

        //Scroll the chat to the bottom.
        historico.scrollTop = historico.scrollHeight;
    });
      
    //Pega o nome do usuário que entrou para coloca-lo no chat.
    var acesso = document.getElementById('login');
    acesso.addEventListener('submit', (event) => {

        event.preventDefault();


        socket.emit('entrar', document.getElementById('apelido').value , function(valido) { 


            if(valido){
                document.getElementById('acesso_usuario').style.display = 'none';
                document.getElementById('sala_chat').style.display = 'block';

            }else{
                document.getElementById('acesso_usuario').value='';
                alert("Nome já utilizado nesta sala");
            }
        });
    });
      
    socket.on("atualizar_usuarios", (usuários) => { 
        //Pegando a lista de usuários no html.
        var lista = document.getElementById('lista_usuarios');

        //Limpando a lista de usuários.
        lista.options.length = 0;

        //Criando options para os usuários.
        var new_option = document.createElement('option'); 
        new_option.setAttribute('class', 'font_participantes');

        //Escrevendo título.
        new_option.appendChild(document.createTextNode('Participantes:'));
        lista.appendChild(new_option);

        console.log('=> Há ' + usuários.length + ' usuários na sala. <=')
        
        //Colocando os users no html um por um.
        var i;
        for ( i = 0; i < usuários.length; i++){
            var option_user = document.createElement('option');
            option_user.setAttribute('class', 'font_users');
            option_user.appendChild(document.createTextNode(usuários[i]));
            lista.appendChild(option_user);
        }
    });
}

/////END/////

function handleError(e) {
    console.log(e);
    alert('Something went wrong');
}

startLocalStream();