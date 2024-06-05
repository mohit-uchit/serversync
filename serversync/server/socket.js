const { Server } = require('socket.io');

let io;

module.exports = {
  initialize: server => {
    io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });
    io.on('connection', socket => {
      socket.on('joinRoom', userId => {
        // console.log(`User ${userId} has connected`);
        socket.join(userId);
      });

      /*
      This is for testing only, not used by FE at all.
      socket.on("newMessages", (message, userId) => {
        console.log("Received new message:", message, " room: ", userId);
        io.to(userId).emit("newMessages", message);
      });
      */
    });
    return io;
  },
  getIo: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },
};
