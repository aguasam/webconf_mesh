//const funcaoStats = require('./func.js');
const {funcaoStats, armazenaMensagem, funcClientsId} = require('../func/func');
/*
describe('teste da funcao de estatisticas', ()=>{
    it('estatisticas', ()=>{
        var stats = []
        stats = {"id_socket":{"localCandidateId":"RTCIceCandidate_mq91Yb5m",
		"remoteCandidateId":"RTCIceCandidate_R9IcpdXY", "packetsLost":0,
		"totalEncodeTime":18.157,"dataChannelsOpened":1,"dataChannelsClosed":0,
		"packetsReceived":464,"packetsSent":482,"bytesSent":453539,"bytesReceived":429132}}
		expect(funcaoStats(stats))//.has('socket_test'))//.toEqual(stats)
    })
})
*/

it('estatisticas', ()=>{
    let stats = new Map
    stats.set("socket_test", {"localCandidateId":"RTCIceCandidate_mq91Yb5m",
    "remoteCandidateId":"RTCIceCandidate_R9IcpdXY","packetsLost":0,
    "totalEncodeTime":18.157,"dataChannelsOpened":1,"dataChannelsClosed":0,
    "packetsReceived":464,"packetsSent":482,"bytesSent":453539,"bytesReceived":429132})
    expect(funcaoStats(stats).has('socket_test')).toEqual(true)

})

it('Teste funcionamento de armazenaMensagem.', ()=>{
    let mensagem = 'mensagem2';
    let ultimas_mensagens = ['Mensagem0', 'mensagem1'];
    expect(armazenaMensagem(mensagem, ultimas_mensagens)).toEqual(["Mensagem0", "mensagem1", "mensagem2"])
})
