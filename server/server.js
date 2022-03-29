const http = require('http') 
const socketio = require('socket.io') 

const httpServer = http.createServer();

const io = new socketio.Server(httpServer, {
    cors: {
      origin: "http://127.0.0.1:5500",
      allowedHeaders: ["my-custom-header"],
      credentials: true
    }
});

io.on('connection', client => {
    client.emit('init', { data: 'hello world' });
});

io.listen(3000);