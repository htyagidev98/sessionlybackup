const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const connectDB = require("./config/DB");
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const cors = require('cors');
const path = require('path');
// const socketIO = require('socket.io');
const http = require('http');
const app = express();
const server = http.createServer(app);
// const io = socketIO(server);
require("dotenv").config();
// Connect Database
connectDB();

//cors
const corsOptions = {
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Serve static files
app.use('/category_pictures', express.static(path.join(__dirname, 'uploads/category_pictures')));
app.use('/course_pictures', express.static(path.join(__dirname, 'uploads/course_pictures')));
app.use('/profile_pictures', express.static(path.join(__dirname, 'uploads/profile_pictures')));
app.use('/videos', express.static(path.join(__dirname, "uploads/videos")));
// app.use('/thumbnails', express.static(path.join(__dirname, 'uploads/thumbnails')));

// Body parsers
app.use(bodyParser.json({ limit: "1000mb" }));
app.use(bodyParser.urlencoded({
    limit: "100mb",
    extended: true,
    parameterLimit: 50000,
}));

// Session middleware
app.use(
    session({
        name: "session",
        secret: 'jons is the best',
        resave: false,
        saveUninitialized: true,
        store: new MongoStore({ mongooseConnection: mongoose.connection }),
    })
);

// Auth API routes
app.use("/", require("./routes/authRoute"));

// Admin API routes
app.use("/admin", require("./routes/categoryRoute"));
app.use("/admin", require("./routes/userRoute"));
app.use("/admin", require("./routes/couponRoute"));
app.use("/admin", require("./routes/profileRoute"));

// Teacher API routes
app.use("/teacher", require("./routes/teacherRoute"));
app.use("/teacher", require("./routes/courseRoute"));

// Common API routes
app.use("/common", require("./routes/commonRoute"));

// Stripe-Payment API routes
app.use("/", require("./routes/paymentRoute"));

// Apppointment API routes
app.use("/", require("./routes/appointmentRoute"));

///socket cors
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: "GET,POST,PUT,DELETE,OPTIONS",
        // allowedHeaders: ["my-custom-header"],
        credentials: true
    }
})
app.use(cors());

// Socket.io connection
io.on('connection', (socket) => {
    console.log('A user connected');
    // Static user data
    const staticUserData = {
        userId: '123',
        userName: 'John Doe'
    };
    // Send static user data to the connected client
    socket.emit('staticUserData', staticUserData);
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Server running port
server.listen(process.env.PORT, process.env.HOSTNAME, () => {
    console.log(`Server running at http://${process.env.HOSTNAME}:${process.env.PORT}`);
});