const RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;

let connections = new Map();
let stats = new Map();

function handleError(err) {
console.log(err);
}

function getStatistics(userId) {
connections.get(userId)
.getStats()
.then((stats) => {
let report = stats.forEach((report) => {
if(report.type === "inbound-rtp" || report.type === "outbound-rtp") {
console.log(report);
}
});
})
.catch(handleError);
}

function startTrackingStatistics(userId, connection) {
connections.set(userId, connection);
setInterval(() => getStatistics(userId), 3000);
}

module.exports = {
startTrackingStatistics,
stats
}