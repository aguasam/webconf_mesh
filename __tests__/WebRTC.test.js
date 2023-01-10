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

//mock navigator and socket
const mockNavigator = {
    mediaDevices: {
      getUserMedia: jest.fn().mockImplementation((constraints) => {
        return Promise.resolve(mockStream);
      })
    }
  };
  global.navigator = mockNavigator;
  
  const mockSocket = {
    on: jest.fn(),
    emit: jest.fn()
  };


//my unit tests
describe('WebRTC', () => {
    beforeEach(() => {
        global.navigator.mediaDevices.getUserMedia.mockClear();
        mockSocket.on.mockClear();
        mockSocket.emit.mockClear();

        // reset localStream and connections before each test
        localStream = null;
        connections.clear();
    });

    test('startLocalStream correctly sets up localStream', async () => {
        const mockStream = {};
        startLocalStream();
    
        expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith(mediaStreamConstraints);
        expect(localStream).toEqual(mockStream);
        expect(mockSocket.on).toHaveBeenCalled();
        expect(mockSocket.emit).toHaveBeenCalled();
        expect(localStream).not.toBe(null);
      
    });

    test('createPeerConnection creates a new RTCPeerConnection and adds localStream', () => {
        let userId = 'test-user';
        let pc = createPeerConnection(userId);

        expect(pc).toBeInstanceOf(RTCPeerConnection);
        expect(connections.get(userId)).toBe(pc);
        expect(pc.getLocalStreams()).toEqual([localStream]);
    });

    test('connectSocketToSignaling correctly handles a "candidate" event', () => {
        let fromId = 'test-user';
        let candidate = {};
        let pc = new RTCPeerConnection();
        connections.set(fromId, pc);

        socket.emit('candidate', {
            fromId: fromId,
            candidate: candidate
        });

        expect(pc.addIceCandidate).toHaveBeenCalledWith(new RTCIceCandidate(candidate));
    });
});
