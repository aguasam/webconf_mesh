//const funcaoStats = require('./func.js');
const {funcaoStats} = require('../func/func');

describe('teste da funcao de estatisticas', ()=>{
    it('estatisticas', ()=>{
        var stats = []
        stats = new Set("socket_test", {"packetsLost":0,
		"totalEncodeTime":18.157,"dataChannelsOpened":1,"dataChannelsClosed":0,
		"packetsReceived":464,"packetsSent":482,"bytesSent":453539,"bytesReceived":429132})
		expect(funcaoStats(stats))/*.has('socket_test'))*/.toEqual(true)
    })
})
