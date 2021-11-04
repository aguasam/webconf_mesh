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
}*/

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



function fconec(connections,userId,socket,localStream){
    connections[userId] = new RTCPeerConnection(mediaStreamConstraints);
    console.log('pre = ' + socket.id + ' ' + userId)
    //connections[userId].onicecandidate = sendCandidate(socket, userId)
    connections[userId].onicecandidate = () => {
        if (event.candidate) {
            console.log('pos = ' + socket.id + ' ' + userId)
            console.log('toId: ' + userId),
            console.log('candidate: ' + event.candidate)
            console.log(socket.id, ' Send candidate to ', userId);
            socket.emit('candidate', { 
                toId: userId,
                candidate: event.candidate, 
            });
        }
    }
    connections[userId].onaddstream = () => {
        gotRemoteStream(event, userId);
    };
    connections[userId].addStream(localStream);
    console.log(connections)
}



//connectSOcketToSignaling
function connectSocketToSignaling(mediaStream) {
    const socket = io.connect('http://localhost:3000', { secure: true });
    socket.on('connect', () => {
        localUserId = socket.id;
        console.log('localUser', localUserId);
        socket.on('user-joined', (data) => {
            const clients = data.clients;
            const joinedUserId = data.joinedUserId;
            console.log(joinedUserId, ' joined');
            /*
            if (Array.isArray(clients) && clients.length > 0) {
                clients.forEach((userId) => {
                    if (!connections[joinedUserId] ) {//&& userId!= localUserId
                        console.log('Entrou aqui e vai fazer uma nova connection')
                        fconec(connections,userId,socket,localStream)
                    }
                    
                });

                if (data.count >= 2) {
                    connections[joinedUserId].createOffer(offerOptions).then((description) => {
                        connections[joinedUserId].setLocalDescription(description).then(() => {
                            console.log(socket.id, ' Send offer to ', joinedUserId);
                            socket.emit('sdp', {
                                toId: joinedUserId,
                                description: connections[joinedUserId].localDescription,
                                type: 'sdp'
                            });
                        }).catch(handleError);
                    });
                }
            }
            */
            if (localUserId != joinedUserId) {
                console.log('Entrou no user-joined')
                const pc = createConnection(joinedUserId, mediaStream, socket);
        
                connections[joinedUserId] = pc
        
                connections[joinedUserId].createOffer(offerOptions).then((description) => {
                    connections[joinedUserId].setLocalDescription(description).then(() => {
                        console.log(socket.id, ' Send offer to ', joinedUserId);
                        socket.emit('offer', {
                            type: "offer",
                            toId: joinedUserId,
                            description: pc.localDescription, 
                        });
                    }).catch(handleError);
                });

                /*
                //creatingOfferFunction(this.connections.get(userId) , joinedUserId);
                let description = pc.createOffer();

                pc.setLocalDescription(description);
                
                console.log(socket.id, " Send offer to ", joinedUserId)

                socket.emit("offer", {
                  type: "offer",
                  toId: joinedUserId,
                  description: pc.localDescription,  
                });
                */
            }

            socket.on("offer", (data) => {
                const fromId = data.fromId;
                  if (data.description) {
                    console.log('Entrou na criação de offer')
          
                    connections[fromId] = createConnection(fromId, mediaStream, socket)
          
                    const connection = connections[fromId]
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
                        type: "answer",
                        toId: fromId,
                        description: connection.localDescription,
                        });
                    })
                    .catch((e) => console.log("Error: ", e));
          
                }
            });

            socket.on("answer", (data) => {
                const fromId = data.fromId;
                console.log("Resposta recebida de:", fromId);
                const connection = connections[fromId]
            
                connection
                .setRemoteDescription(new RTCSessionDescription(data.description))
                .catch((e) => console.log("Error: ", e));
            });









            ///////////////////testando a saida/////////
            socket.on('user-left', (userId) => {
                let video = document.querySelector('[data-socket="'+ userId +'"]');
                video.parentNode.removeChild(video);
                //printa connection
                console.log(connections[userId] + ' left')
                //remove o connection
                delete connections[userId];
            });
            /////////////////////////////////////////////
            socket.on('candidate', (data) => {
                //candidate(socket, data);
                const fromId = data.fromId;
                console.log(socket.id, ' Receive Candidate from ', fromId);
                if (data.candidate) {
                    gotIceCandidate(fromId, data.candidate);
                }
            });
            
            socket.on('sdp', (data) => {
                sdp(socket, data);
            });

        });
    })
}
/////end/////

function candidate(socket, data){
    const fromId = data.fromId;
    console.log(socket.id, ' Receive Candidate from ', fromId);
    if (data.candidate) {
        gotIceCandidate(fromId, data.candidate);
    }
}

function sdp(socket, data){
    const fromId = data.fromId;
    if (data.description) {
        console.log(socket.id, ' Receive sdp from ', fromId);
        connections[fromId].setRemoteDescription(new RTCSessionDescription(data.description))
        connections[fromId].createAnswer()
        .then((description) => {
            connections[fromId].setLocalDescription(description).then(() => {
                console.log(socket.id, ' Send answer to ', fromId);
                socket.emit('sdp', {
                    type: 'sdp',
                    toId: fromId,
                    description: connections[fromId].localDescription
                });
            });
        })
        .catch(handleError);
    }
}
/*
function offer(socket, data, fromId){
    if (data.description.type === 'offer') {
        connections[fromId].createAnswer()
            .then((description) => {
                connections[fromId].setLocalDescription(description).then(() => {
                    console.log(socket.id, ' Send answer to ', fromId);
                    socket.emit('sdp', {
                        type: 'sdp',
                        toId: fromId,
                        description: connections[fromId].localDescription
                    });
                });
            })
            .catch(handleError);
    }
}
*/
/////END/////

function getUserMediaSuccess(mediaStream) {
    localStream = mediaStream;
    localVideo.srcObject = mediaStream;
}

function handleError(e) {
    console.log(e);
    alert('Something went wrong');
}


function createConnection(userId, mediaStream,socket) {
    const pc = new RTCPeerConnection();
    let track = 0;
    console.log('Connection de ' + userId +' com '+ socket.id)
    pc.onicecandidate = (evt) => {
      if (evt.candidate) {
        console.log(socket.id, " Send candidate to ", userId);
        socket.emit("candidate", {
        type: "candidate",
        candidate: evt.candidate,
        toId: userId,
        });
      }
    };
    connections[userId] = pc
    connections[userId].onaddstream = () => {
        gotRemoteStream(event, userId);
    };
    connections[userId].addStream(localStream);

    connections[userId] = pc

    return pc;
}



startLocalStream();
