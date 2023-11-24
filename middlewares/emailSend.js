const nodemailer = require('nodemailer');
const sendMail = () => {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'htyagistaple246@gmail.com',
            pass: 'itrkewxqlnkamhej'
        },
    })
};
module.exports = sendMail;
