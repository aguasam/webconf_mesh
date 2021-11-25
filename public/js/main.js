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

function createPC(socket, localStream, userId){
    const pc = new RTCPeerConnection(mediaStreamConstraints);
    pc.onicecandidate = () => {
        if (event.candidate && (socket.id != userId)) {
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

    /////estats/////
    setInterval(() => {
        this.estatisticas(socket, pc);
      },1000)
    ///////////////
    return pc;
}

//connectSOcketToSignaling
function connectSocketToSignaling() {
    const socket = io.connect('http://localhost:3000', { secure: true });
    var dadosClients = new Object();

$("form#chat").submit(function(e){     // Irá pegar a msg do input 
    e.preventDefault();
    socket.emit("enviar mensagem", $(this).find("#texto_mensagem").val(), function(){ //vai mandar para o index.js
        $("form#chat #texto_mensagem").val("");
    });  
});

////////////////////////////////////////////////////////////////////////////
    socket.on('connect', () => {
        localUserId = socket.id;
        console.log('localUser', localUserId);
        
        socket.on('user-joined', (data) => {
            const clients = data.clients;
            const joinedUserId = data.joinedUserId;
            console.log(joinedUserId, ' joined');
            const fromId = data.fromId;

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
                if(document.querySelector('[data-socket="'+ userId +'"]')){
                    let video = document.querySelector('[data-socket="'+ userId +'"]');
                    video.parentNode.removeChild(video);
                }
               // this.emit("user-left", userId);
                //this.remoteStreams.delete(userId.id);
                //printa connection
                console.log(userId + ' left')
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
//////////////////////////////////////////////////////////////////////////////////////

    socket.on("atualizar mensagens", function(mensagem){    //Pega a msg escrita e mandar para o idex.js para madar pro historico
        var mensagem_formatada = $("<p />").text(mensagem);
        $("#historico_mensagens").append(mensagem_formatada); //Coloca a msg no historico
    });
      
    $("form#login").submit(function(e){  //pagina antes do chat para colocar usuriario
        e.preventDefault();
      
        socket.emit("entrar", $(this).find("#apelido").val(), function(valido){ //Verifica se o usuario é valido
            
            
            if(valido){
                $("#acesso_usuario").hide();  // se for ele esconde a pagina de acesso
                $("#sala_chat").show();         // e mostra o chat
            }else{
                $("#acesso_usuario").val("");
                alert("Nome já utilizado nesta sala");
            }
            
        });
    });
      
    socket.on("atualizar usuarios", function(usuarios){ //manda na section os usuarios 
        $("#lista_usuarios").empty();  
        $("#lista_usuarios").append("<option value=''>Todos</option>");
        $.each(usuarios, function(indice){
    
            var opcao_usuario = $("<option />").text(usuarios[indice]);
            dadosClients.usuarios = usuarios
            //console.log("OP: ",usuarios)
            $("#lista_usuarios").append(opcao_usuario);
        });
    });
}

/////END/////

function getUserMediaSuccess(mediaStream) {
    localStream = mediaStream;
    localVideo.srcObject = mediaStream;
}

function handleError(e) {
    console.log(e);
    alert('Something went wrong');
}

startLocalStream();