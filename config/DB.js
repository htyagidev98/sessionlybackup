const mongoose = require('mongoose')

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log(` DataBase Conneted`);
    } catch (error) {
        console.log(`Error in Mongodb ${error}`);
    }
};

module.exports = connectDb;
