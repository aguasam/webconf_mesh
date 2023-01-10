const RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
const RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;
const RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;

const mediaStreamConstraints = {
    video: true,
    audio: true,
};
const offerOptions = {
    offerToReceiveVideo: 1,
    offerToReceiveAudio: 1
};
let localStream;
let localUserId;
let connections = new Map();

function handleError(err) {
    console.log(err);
}

function gotRemoteStream(event, userId) {
    let remoteVideo = document.createElement('video');
    remoteVideo.srcObject = event.stream;
    remoteVideo.autoplay = true;
    remoteVideo.muted = true;
    document.querySelector('.videos').appendChild(remoteVideo);
}

function gotIceCandidate(fromId, candidate) {
    connections.get(fromId)
    .addIceCandidate(new RTCIceCandidate(candidate))
    .catch(handleError);
}

function startLocalStream() {
    navigator.mediaDevices
    .getUserMedia(mediaStreamConstraints)
    .then((mediaStream) => {
localStream = mediaStream;
localVideo.srcObject = mediaStream;
connectSocketToSignaling(mediaStream);
})
.catch((e) => console.log("Error: ", e));
}

function createPeerConnection(userId) {
let pc = new RTCPeerConnection();
connections.set(userId, pc);
pc.addStream(localStream);
pc.onicecandidate = function(event) {
if (event.candidate) {
socket.emit('candidate', {
toId: userId,
candidate: event.candidate
});
}
};
pc.ontrack = function(event) {
gotRemoteStream(event, userId);
};
return pc;
}

function connectSocketToSignaling(mediaStream) {
socket.on('candidate', function(data) {
let fromId = data.fromId;
let candidate = data.candidate;
if (!connections.has(fromId)) {
let pc = createPeerConnection(fromId);
pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(handleError);
}
});
}
