const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/user')
const nodemailer = require('nodemailer')

//Protected Routes token base

module.exports = {
    xAccessToken: async (req, res, next) => {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(400).json({
                status: "error", responseMessage: "Bearer Token not Provided.",
            });
        }
        const token = authHeader.split(' ')[1];
        if (token) {
            jwt.verify(token, config.secret, async (err, decoded) => {
                if (err) {
                    return res.status(400).json({
                        status: "error", responseMessage: "Invalid Access Token",
                    });
                } else {
                    var authenticate = await User.findOne({
                        _id: decoded._id,
                        device: { $elemMatch: { token: token } },
                    }).exec();
                    if (authenticate) {
                        await User.findOneAndUpdate(
                            { _id: decoded._id },
                            { $set: { updated_at: new Date() } },
                            { new: true }
                        ).clone();
                        req.user = authenticate;
                        next();
                    } else {
                        return res.status(401).json({
                            status: "error", responseMessage: "Unauthorized",
                        });
                    }
                }
            });
        } else {
            return res.status(400).json({
                status: "error", responseMessage: "Unauthorized Access Token",
            });
        }
    },

    // Middleware to check if the user has the 'admin' role
    isAdmin: async (req, res, next) => {
        const decodedUser = req.user;
        if (decodedUser && decodedUser.role === 'admin') {
            next();
        } else {
            return res.status(403).json({
                status: "error",
                responseMessage: "Unauthorized User.",
            });
        }
    },

    isTeacher: async (req, res, next) => {
        const decodedUser = req.user;
        if (decodedUser && decodedUser.role === 'expert') {
            next();
        } else {
            return res.status(403).json({
                status: "error",
                responseMessage: "Unauthorized User.",
            });
        }
    },


};
