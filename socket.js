let io;

module.exports = {
    init: httpServer => {
        io = require('socket.io')(httpServer, {
            cors: {
                origin: "http://localhost:5173",
                methods: "GET,POST,PUT,DELETE,OPTIONS",
                // allowedHeaders: ["my-custom-header"],
                credentials: true
            }
        })
        return io
    },

    getIo: () => {
        if (!io) {
            throw new Error('Io instance not initialised');
        }
        return io
    }
}