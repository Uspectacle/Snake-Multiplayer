const io = require('socket.io')({
    cors: {
        origin: "http://127.0.0.1:5500",
        credentials: true,
    }
});

io.on('connection', client => {
    client.emit('init', { data: 'hello world' });
});

io.listen(3000);