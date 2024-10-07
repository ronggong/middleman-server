const net = require('net');
const WebSocket = require('ws');

// Create WebSocket server
const wss = new WebSocket.Server({'port': 8080});

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  ws.send('Connected to WebSocket server');
});

const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    const receivedData = data.toString();
    console.log('Received data:', receivedData);

    // Broadcast data to all WebSocket clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`New data received: ${receivedData}`);
      }
    });
  });
});

server.listen(12345, '127.0.0.1', () => {
  console.log('TCP server listening on port 12345');
});
