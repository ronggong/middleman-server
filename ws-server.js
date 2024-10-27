const WebSocket = require('ws');

// Create WebSocket server on port 8080
const wss = new WebSocket.Server({ port: 8080 });

// Map to store pairs of sender and receiver clients
const clients = {};

wss.on('connection', (ws) => {
  console.log('New client connected');

  // Ask the client what type it is and which pair it belongs to
  ws.send('Please identify: sender or receiver, and provide your pairId.');

  ws.on('message', (message) => {
    // Convert buffer to string, if necessary
    if (Buffer.isBuffer(message)) {
      message = message.toString('utf8');
    }

    console.log('Received:', message);

    // Parse the message to extract type and pairId
    const [role, pairId] = message.split(':');

    if (role === 'sender') {
      // Register this client as a sender for the given pairId
      if (!clients[pairId]) {
        clients[pairId] = { sender: null, receiver: null };
      }
      clients[pairId].sender = ws;
      console.log(`Client registered as sender for pairId: ${pairId}`);

    } else if (role === 'receiver') {
      // Register this client as a receiver for the given pairId
      if (!clients[pairId]) {
        clients[pairId] = { sender: null, receiver: null };
      }
      clients[pairId].receiver = ws;
      console.log(`Client registered as receiver for pairId: ${pairId}`);

    } else if (clients[pairId] && ws === clients[pairId].sender && clients[pairId].receiver) {
      // Forward message from sender to receiver for this pairId
      console.log(`Forwarding message from sender to receiver for pairId ${pairId}: ${message}`);
      clients[pairId].receiver.send(message);
    }
  });

  // Handle client disconnections
  ws.on('close', () => {
    console.log('Client disconnected');

    // Remove client from the pairs map
    Object.keys(clients).forEach((pairId) => {
      if (clients[pairId].sender === ws) {
        clients[pairId].sender = null;
        console.log(`Sender disconnected for pairId: ${pairId}`);
      }
      if (clients[pairId].receiver === ws) {
        clients[pairId].receiver = null;
        console.log(`Receiver disconnected for pairId: ${pairId}`);
      }

      // Clean up the entry if both sender and receiver are disconnected
      if (!clients[pairId].sender && !clients[pairId].receiver) {
        delete clients[pairId];
        console.log(`Cleaned up pairId: ${pairId}`);
      }
    });
  });
});

console.log('WebSocket server is running on ws://localhost:8080');

