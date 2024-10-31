const http = require('http');
const app = require('./app');
const server = http.createServer(app);
const socketIo = require('socket.io');

const io = socketIo(server);

// Lyt til klientforbindelser
io.on('connection', (socket) => {
    console.log('Ny klient forbundet');

    socket.on('disconnect', () => {
        console.log('Klient afbrudt');
    });
});

// Gem io-objektet i app, så det kan bruges andre steder
app.set('socketio', io);

// Start serveren
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

const path = require('path');

// Route til startsiden (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/src/index.html'));
});

