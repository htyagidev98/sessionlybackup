const User = require('../models/user')
const jwt = require("jsonwebtoken")
const Validator = require("validatorjs")
const bcrypt = require("bcryptjs")
const config = require("../config")
const sendEmail = require("../middlewares/emailSend");
const crypto = require('crypto');
const fun = require("../middlewares/webSocket");
const messages = require("../utils/messages");
uuidv1 = require("uuid").v1
moment = require("moment-timezone")
_ = require("lodash");

/////Registration API////
exports.signUp = async (req, res) => {
    try {
        const rules = {
            first_name: "required", last_name: "required", email: "required", phone: "required|numeric|digits_between:10,14",
            password: "required|min:8", confirm_password: "required"
        };
        const validation = new Validator(req.body, rules);
        if (validation.fails()) {
            res.status(422).json({
                status: messages.ERROR_STATUS,
                responseMessage: messages.VALIDATION_ERROR, responseData: validation.errors.all(),
            });
        } else {
            const { first_name, last_name, email, password, confirm_password, phone } = req.body;
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).*$/;
            const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!regex.test(email)) {
                res.status(400).json({
                    status: messages.ERROR_STATUS, responseMessage: messages.INVALID_EMAIL, responseData: {}
                });
            } else if (!passwordRegex.test(password)) {
                res.status(400).json({
                    status: messages.ERROR_STATUS,
                    responseMessage: messages.INVALID_PASSWORD,
                    responseData: {},
                });
            } else if (password !== confirm_password) {
                res.status(400).json({
                    status: messages.ERROR_STATUS, responseMessage: messages.PASSWORD_CONFIRM_PASSWORD_NOT_MATCH, responseData: {}
                });
            } else {
                const checkEmail = await User.findOne({ email: email }).lean();
                if (!checkEmail) {
                    const hashPassword = await bcrypt.hash(password, 10);
                    const userData = await User.create({
                        first_name: first_name,
                        last_name: last_name,
                        email: email,
                        phone: phone,
                        password: hashPassword,
                        account_info: { status: "active" }
                    });
                    fun.webNotification(userData);
                    res.status(201).json({
                        status: messages.SUCCESS_STATUS, responseMessage: messages.SIGN_UP_SUCCESS, responseData: userData
                    });
                } else {
                    res.status(403).json({
                        status: messages.ERROR_STATUS, responseMessage: messages.EMAIL_EXISTING, responseData: {}
                    });
                }
            }
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({
            status: messages.ERROR_STATUS, responseMessage: messages.SERVER_ERROR, responseData: {}
        });
    }
};

///////LOGIN API/////////
exports.logIn = async (req, res) => {
    try {
        const rules = { email: "required", password: "required" };
        const validation = new Validator(req.body, rules);
        if (validation.fails()) {
            res.status(422).json({
                status: messages.ERROR_STATUS,
                responseMessage: messages.VALIDATION_ERROR, responseData: validation.errors.all(),
            });
        } else {
            const { email, password } = req.body;
            let user = await User.findOne({ email: email }).lean();
            if (user) {
                if (user.account_info.status == "active") {
                    if (!bcrypt.compareSync(password, user.password)) {
                        res.status(400).json({
                            status: messages.ERROR_STATUS, responseMessage: messages.INVALID_CREDENATILS, responseData: {}
                        });
                    } else {
                        const payload = {
                            _id: user._id, first_name: user.first_name,
                            last_name: user.last_name, email: user.email,
                            role: user.role
                        };
                        let token = jwt.sign(payload, config.secret);  //{ expiresIn: '30d' }
                        let uuid = uuidv1();
                        let deviceInfo = [];
                        deviceInfo = _.filter(user.device, (device) => device.uuid != uuid);
                        deviceInfo.push({
                            uuid: uuid,
                            token: token,
                        });
                        await User.findByIdAndUpdate({ _id: user._id, }, { $set: { device: deviceInfo } },
                            { new: false });
                        let userDetails = await User.findOne({ _id: user._id, }).lean();
                        fun.loginNotification(userDetails);
                        res.status(200).json({
                            status: messages.SUCCESS_STATUS,
                            responseMessage: messages.LOGIN_SUCCESS,
                            responseData: {
                                _id: userDetails._id,
                                first_name: userDetails.first_name,
                                last_name: userDetails.last_name,
                                email: userDetails.email,
                                phone: userDetails.phone,
                                role: userDetails.role,
                            },
                            token: token,
                            uuid: userDetails.device[0].uuid
                        });
                    }
                } else {
                    res.status(403).json({
                        status: messages.ERROR_STATUS, responseMessage: messages.ACCOUNT_STATUS, responseData: {}
                    });
                }
            } else {
                res.status(404).json({
                    status: messages.ERROR_STATUS, responseMessage: messages.USER_NOT_FOUND, responseData: {}
                });
            }
        };
    } catch (err) {
        console.error(err)
        res.status(500).json({
            status: messages.ERROR_STATUS, responseMessage: messages.SERVER_ERROR, responseData: {}
        });
    }
};

/////ForgotPassword API/////
exports.forgotPassword = async (req, res) => {
    try {
        const rules = { email: "required" };
        var validation = new Validator(req.body, rules);
        if (validation.fails()) {
            res.status(422).json({
                status: messages.ERROR_STATUS,
                responseMessage: messages.VALIDATION_ERROR, responseData: validation.errors.all(),
            })
        } else {
            const { email } = req.body;
            let user = await User.findOne({ email }).lean();
            if (user) {
                const resetToken = crypto.randomBytes(20).toString('hex');
                let data = {
                    'auth.resetToken': resetToken,
                    'auth.expires': new Date(Date.now() + 5 * 60000) // expires 5 minutes 
                }
                const resetLink = `${process.env.APP_URL}/create-password/${resetToken}`;

                const transporter = sendEmail();
                const emailHtml = `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2 style="color: #333;">Forgot Password - Reset Password</h2>
                        <p>You are receiving this email because you have requested a password reset for your account.</p>
                        <p>Please click the following link to reset your password:</p>
                        <a href="${resetLink}" style="background-color: #007BFF; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Reset Password</a>
                        <p>If you did not request this password reset, please ignore this email.</p>
                    </div>
                `;
                await transporter.sendMail({
                    from: '"stapletest" <htyagistaple246@gmail.com>',
                    to: user.email,
                    subject: 'Forgot Password - Reset_password ',
                    html: emailHtml,
                });
                await User.findOneAndUpdate({ _id: user._id }, { $set: data }, { new: true });
                res.status(200).json({
                    status: messages.SUCCESS_STATUS,
                    responseMessage: messages.SEND_LINK,
                    responseData: {
                        id: user._id,
                        email: user.email,
                        resetToken: resetToken,
                        resetLink: resetLink
                    }
                });
            } else {
                res.status(400).json({
                    status: messages.ERROR_STATUS, responseMessage: messages.USER_NOT_FOUND, responseData: {}
                });
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: messages.ERROR_STATUS, responseMessage: messages.SERVER_ERROR, responseData: {}
        });
    }
};

///Create New Password////
exports.resetPassword = async (req, res) => {
    try {
        const rules = { new_password: "required|min:8", confirm_password: "required" }
        var validation = new Validator(req.body, rules);
        if (validation.fails()) {
            res.status(422).json({
                status: messages.ERROR_STATUS,
                responseMessage: messages.VALIDATION_ERROR, responseData: validation.errors.all(),
            })
        } else {
            const { reset_token } = req.query;
            const { new_password, confirm_password } = req.body;
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).*$/;
            if (!passwordRegex.test(new_password)) {
                res.status(400).json({
                    status: messages.ERROR_STATUS,
                    responseMessage: messages.INVALID_PASSWORD,
                    responseData: {},
                });
            } else if (new_password !== confirm_password) {
                res.status(400).json({
                    status: messages.ERROR_STATUS,
                    responseMessage: messages.NEW_PASSWORD_CONFIRM_PASSWORD_NOT_MATCH, responseData: {}
                });
            } else {
                let user = await User.findOne({ 'auth.resetToken': reset_token, "auth.expires": { $gte: new Date() } }).lean();
                if (user) {
                    let newhash = bcrypt.hashSync(new_password, 10);
                    await User.findOneAndUpdate({ _id: user._id }, { $set: { password: newhash } }, { new: true });
                    res.status(201).json({
                        status: messages.SUCCESS_STATUS, responseMessage: messages.RESET_PASSWORD
                    });
                } else {
                    res.status(400).json({
                        status: messages.ERROR_STATUS, responseMessage: messages.INVALID_RESET_TOKEN, responseData: {},
                    });
                };
            }
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({
            status: messages.ERROR_STATUS, responseMessage: messages.SERVER_ERROR, responseData: {},
        })
    }
};

////ResetPassword API///
exports.changePassword = async (req, res) => {
    try {
        const rules = { old_password: "required", new_password: "required|min:8" }
        var validation = new Validator(req.body, rules);
        if (validation.fails()) {
            res.status(422).json({
                status: messages.ERROR_STATUS,
                responseMessage: messages.VALIDATION_ERROR, responseData: validation.errors.all(),
            })
        } else {
            const { old_password, new_password } = req.body;
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).*$/;
            if (!passwordRegex.test(new_password)) {
                res.status(400).json({
                    status: messages.ERROR_STATUS, responseMessage: messages.INVALID_PASSWORD, responseData: {},
                });
            } else {
                let user = await User.findById(req.user._id).lean();
                if (user) {
                    if (old_password !== new_password) {
                        let newhash = bcrypt.hashSync(new_password);
                        bcrypt.compare(old_password, user.password, async (err, status) => {
                            if (status == true) {
                                const payload = {
                                    _id: user._id, first_name: user.first_name,
                                    last_name: user.last_name, email: user.email,
                                    role: user.role
                                };
                                let token = jwt.sign(payload, config.secret);
                                var device = _.filter(user.device, device => device.token == token);
                                var updateData = {
                                    password: newhash,
                                    device: device,
                                }
                                const data = await User.findOneAndUpdate({ _id: req.user._id },
                                    { $set: updateData }, { new: true });
                                if (!data) {
                                    res.status(422).json({
                                        status: messages.ERROR_STATUS,
                                        responseMessage: messages.PASSWORD_NOT_UPDATE, responseData: {},
                                    });
                                } else {
                                    res.status(201).json({
                                        status: messages.SUCCESS_STATUS,
                                        responseMessage: messages.CHANGE_PASSWORD_SUCCESS, responseData: {}
                                    });
                                }
                            } else {
                                res.status(400).json({
                                    status: messages.ERROR_STATUS,
                                    responseMessage: messages.OLD_PASSWORD_WRONG, responseData: {},
                                })
                            }
                        });
                    } else {
                        res.status(400).json({
                            status: messages.ERROR_STATUS,
                            responseMessage: messages.OLD_NEW_PASSWORD_NOT_SAME, responseData: {},
                        });
                    };
                } else {
                    res.status(400).json({
                        status: messages.ERROR_STATUS, responseMessage: messages.USER_NOT_FOUND, responseData: {}
                    })
                }
            }
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({
            status: messages.ERROR_STATUS, responseMessage: messages.SERVER_ERROR, responseData: {},
        })
    }

};
