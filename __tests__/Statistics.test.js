const { startTrackingStatistics, stopTrackingStatistics, stats } = require('./Statistics');

describe('Statistics', () => {
  let pc;

  beforeEach(() => {
    pc = new RTCPeerConnection();
    startTrackingStatistics(pc);
  });

  afterEach(() => {
    stopTrackingStatistics(pc);
  });

  test('startTrackingStatistics() should start tracking statistics', () => {
    expect(stats).toHaveProperty('bytesSent', 0);
    expect(stats).toHaveProperty('bytesReceived', 0);
    expect(stats).toHaveProperty('packetsSent', 0);
    expect(stats).toHaveProperty('packetsReceived', 0);
  });

  test('stopTrackingStatistics() should stop tracking statistics', () => {
    stopTrackingStatistics(pc);
    expect(stats).toEqual({});
  });

  test('stats should be updated after sending a message', () => {
    pc.send('Hello, World!');
    expect(stats.bytesSent).toBeGreaterThan(0);
    expect(stats.packetsSent).toBeGreaterThan(0);
  });

  test('stats should be updated after receiving a message', () => {
    const message = 'Hello, World!';
    const dataChannel = pc.createDataChannel('Test');
    dataChannel.onmessage = (event) => {
      expect(event.data).toBe(message);
      expect(stats.bytesReceived).toBeGreaterThan(0);
      expect(stats.packetsReceived).toBeGreaterThan(0);
    };

    dataChannel.onopen = () => {
      dataChannel.send(message);
    };
  });
});
