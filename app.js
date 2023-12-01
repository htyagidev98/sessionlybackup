const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const connectDB = require("./config/DB");
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const cors = require('cors');
const path = require('path');
const app = express();
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

// Server running port
const http = app.listen(process.env.PORT, process.env.HOSTNAME, () => {
    console.log(`Server running at http://${process.env.HOSTNAME}:${process.env.PORT}`);
});

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

const io = require('./socket').init(http)
io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// Auth API routes
app.use("/", require("./routes/authRoute"));

// Admin API routes
app.use("/admin", require("./routes/categoryRoute"));
app.use("/admin", require("./routes/userRoute"));
app.use("/admin", require("./routes/couponRoute"));
app.use("/admin", require("./routes/profileRoute"));
// Notification API routes
app.use("/admin", require("./routes/notificationRoute"));

// Teacher API routes
app.use("/teacher", require("./routes/teacherRoute"));
app.use("/teacher", require("./routes/courseRoute"));

// Common API routes
app.use("/common", require("./routes/commonRoute"));

// Stripe-Payment API routes
app.use("/", require("./routes/paymentRoute"));

// Apppointment API routes
app.use("/", require("./routes/appointmentRoute"));



