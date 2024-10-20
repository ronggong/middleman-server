const WebSocket = require('ws');

// Create WebSocket server on port 8080
const wss = new WebSocket.Server({ port: 8080 });

let senderClient = null;
let receiverClient = null;

wss.on('connection', (ws) => {
  console.log('New client connected');

  // Ask the client what type it is (sender or receiver)
  ws.send('Are you a sender or receiver?');

  ws.on('message', (message) => {
    // Convert buffer to string, if necessary
    if (Buffer.isBuffer(message)) {
      message = message.toString('utf8');
    }

    console.log('Received:', message);

    // Handle client role assignment
    if (message === 'sender') {
      senderClient = ws;
      console.log('Client registered as sender');
    } else if (message === 'receiver') {
      receiverClient = ws;
      console.log('Client registered as receiver');
    } else {
      // Transfer message from sender to receiver
      if (ws === senderClient && receiverClient) {
        console.log('Forwarding message from sender to receiver:', message);
        receiverClient.send(message);
      }
    }
  });

  // Handle client disconnections
  ws.on('close', () => {
    console.log('Client disconnected');
    if (ws === senderClient) {
      senderClient = null;
      console.log('Sender disconnected');
    }
    if (ws === receiverClient) {
      receiverClient = null;
      console.log('Receiver disconnected');
    }
  });
});

console.log('WebSocket server is running on ws://localhost:8080');

