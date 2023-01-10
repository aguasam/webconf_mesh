const app = require('./app');
const io = require('socket.io')(http);

describe('server', () => {
    beforeEach(() => {
        io.emit = jest.fn();
    });

    describe('start-stream', () => {
        it('should emit "offer" with the correct data', () => {
            const mockOffer = {
                description: {
                    type: 'offer',
                    sdp: 'example sdp'
                },
                fromId: '12345'
            };
            io.emit('start-stream');
            expect(io.emit).toHaveBeenCalledWith('offer', mockOffer);
        });
    });

    describe('offer', () => {
        it('should create a new RTCPeerConnection and add it to the connections map', () => {
            const mockData = {
                description: {
                    type: 'offer',
                    sdp: 'example sdp'
                },
                fromId: '12345'
            };
            io.emit('offer', mockData);
            expect(connections.size).toEqual(1);
            expect(connections.get('12345')).toBeInstanceOf(RTCPeerConnection);
        });
    });

    describe('answer', () => {
        it('should set the remote description on the correct RTCPeerConnection', () => {
            const mockData = {
                description: {
                    type: 'answer',
                    sdp: 'example sdp'
                },
                fromId: '12345'
            };
            const mockConnection = new RTCPeerConnection();
            connections.set('12345', mockConnection);
            io.emit('answer', mockData);
            expect(mockConnection.remoteDescription).toEqual(mockData.description);
        });
    });

    describe('entrar', () => {
        it('should add the new user to the usuarios map', () => {
            io.emit('entrar', 'test user');
            expect(usuarios.size).toEqual(1);
            expect(usuarios.get('test user')).toBeDefined();
        });
    });
});
