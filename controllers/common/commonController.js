const Category = require('../../models/category')
const Course = require('../../models/course')
const Profile = require('../../models/profile')
const Payment = require('../../models/payment')
const UserAvailabilities = require('../../models/userAvailabities')
const User = require('../../models/user')
const Validator = require("validatorjs")
moment = require("moment-timezone")
config = require('../../config')
_ = require("lodash");


//GET All Category Common api

exports.allCategories = async (req, res) => {
    try {
        const categories = await Category.find()
            .select({
                title: 1, description: 1, image_url: 1, status: 1,
                subcategories: { $ifNull: ['$subcategories', []] },
                createdAt: 1,          //Using 1: Indicates that the field should be included in the result
                updatedAt: 1,
            })
            .sort({ createdAt: -1 })
            .lean();
        if (categories && categories.length > 0) {
            res.status(200).json({
                status: "success",
                counts: categories.length,
                responseMessage: "Successfully",
                responseData: categories,
            });
        } else {
            res.status(404).json({
                status: "error", responseMessage: "Categories Not Found", responseData: {}
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {},
        });
    }
};

//GET Categorylist with zero subcategory
exports.getCategorylist = async (req, res) => {
    try {
        const categories = await Category.find({ subcategories: { $size: 0 } }).select({
            title: 1, description: 1, image_url: 1, status: 1,
            subcategories: [],
            createdAt: 1,                    //Using 1: Indicates that the field should be included in the result
            updatedAt: 1,
        })
            .sort({ createdAt: -1 })
            .lean();
        if (categories && categories.length > 0) {
            res.status(200).json({
                status: "success",
                counts: categories.length,
                responseMessage: "Successfully",
                responseData: categories,
            });
        } else {
            res.status(404).json({
                status: "error", responseMessage: "categories Not Found", responseData: {}
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {}
        });
    }
};

//Search Experts by category
exports.searchExperts = async (req, res) => {
    const { pages, limits, category, subCategory, teacherName } = req.query;
    let page = 0;
    if (pages) {
        page = parseInt(pages);
    }
    let limit = 15;
    if (limits) {
        limit = parseInt(limits);
    }
    try {
        let filter = [];

        if (category || subCategory) {
            const matchQuery = {};

            if (category) {
                matchQuery['category.title'] = { $regex: new RegExp(category, 'i') };
            }
            if (subCategory) {
                matchQuery['category.subcategories.sub_title'] = { $regex: new RegExp(subCategory, 'i') };
            }

            filter = await Course.aggregate([
                {
                    $lookup: {
                        from: 'Category',
                        localField: 'category',
                        foreignField: '_id',
                        as: 'category',
                    },
                },
                {
                    $unwind: '$category',
                },
                {
                    $match: matchQuery,
                },
                {
                    $lookup: {
                        from: 'User',
                        localField: 'teacher',
                        foreignField: '_id',
                        as: 'userDetails',
                    },
                },
                {
                    $unwind: '$userDetails',
                },
                { $sort: { createdAt: -1 } },
                { $skip: limit * page },
                { $limit: limit },
            ]);
            if (filter.length > 0) {
                let expertData = [];
                for (let i = 0; i < filter.length; i++) {
                    let expertObj = {};
                    expertObj.course_id = filter[i]?._id,
                        expertObj.course_title = filter[i]?.title,
                        expertObj.course_description = filter[i]?.description,
                        expertObj.price = filter[i]?.price,
                        expertObj.course_duration = filter[i]?.duration,
                        expertObj.course_image_url = filter[i]?.image_url,
                        expertObj.teacher_id = filter[i].userDetails?._id,
                        expertObj.teacher_first_name = filter[i].userDetails?.first_name,
                        expertObj.teacher_last_name = filter[i].userDetails?.last_name,
                        expertObj.teacher_email = filter[i].userDetails?.email,
                        expertObj.teacher_phone = filter[i].userDetails?.phone,
                        expertObj.teacher_country_origin = filter[i].userDetails?.country_origin
                    // expertObj.createdAt = moment(filter[i].createdAt).format("DD-MM-YYYY h:mm:ss A"),
                    // expertObj.updatedAt = moment(filter[i].updatedAt).format("DD-MM-YYYY h:mm:ss A")
                    let profile = await Profile.find({ teacher: `${filter[i].teacher}` })
                    for (let j = 0; j < profile.length; j++) {
                        if (profile.length > 0) {
                            expertObj.profile_id = profile[j]?._id,
                                expertObj.language = profile[j]?.language,
                                expertObj.level = profile[j]?.level,
                                expertObj.subject_taught = profile[j]?.subject_taught,
                                expertObj.hourly_rate = profile[j]?.hourly_rate,
                                expertObj.head_line = profile[j]?.head_line,
                                expertObj.about_the_expert = profile[j]?.about_the_expert,
                                expertObj.profile_image_url = profile[j]?.image_url
                        }
                    }
                    expertData.push(expertObj);
                }
                res.status(200).json({
                    status: "success",
                    counts: expertData.length,
                    responseMessage: "Successfully",
                    responseData: expertData,
                });
            }
        } else {
            res.status(404).json({
                status: "error", responseMessage: "No data found.", responseData: [],
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {}
        });
    }
};


// Get TEACHER Profile details
exports.teacherProfileDetails = async (req, res) => {
    try {
        const { teacherId } = req.query;
        let ProfileData = await Profile.findOne({ teacher: teacherId }).populate({
            path: "teacher", select: "first_name last_name email phone country_origin role account_info"
        }).lean();
        if (ProfileData) {
            const data = {
                _id: ProfileData._id,
                language: ProfileData.language,
                level: ProfileData.level,
                subject_taught: ProfileData.subject_taught,
                hourly_rate: ProfileData.hourly_rate,
                head_line: ProfileData.head_line,
                about_the_expert: ProfileData.about_the_expert,
                video_url: ProfileData.video_url,
                video_size: ProfileData.video_size,
                video_duration: ProfileData.video_duration,
                thumbnail_url: ProfileData.thumbnail_url,
                image_url: ProfileData.image_url,
                teacher: ProfileData.teacher,
                createdAt: moment(ProfileData.createdAt).format("DD-MM-YYYY h:mm:ss A"),
                updatedAt: moment(ProfileData.updatedAt).format("DD-MM-YYYY h:mm:ss A"),
            }
            res.status(200).json({
                status: "success", responseMessage: "Fetch Successfully", responseData: data,
            });
        } else {
            res.status(422).json({
                status: "error", responseMessage: "No data found ", responseData: {},
            });
        };
    } catch (err) {
        console.error(err)
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {},
        });
    };
};

//Get Teacher Availabities
exports.teacherAvailabities = async (req, res) => {
    try {
        const { teacherId } = req.query;
        let availableData = await UserAvailabilities.findOne({ teacher: teacherId }).populate({
            path: "teacher", select: "first_name last_name email phone country_origin role account_info"
        }).lean();
        if (availableData) {
            const data = {
                _id: availableData._id,
                day: availableData.day,
                time_from: availableData.time_from,
                time_to: availableData.time_to,
                teacher: availableData.teacher,
                createdAt: moment(availableData.createdAt).format("YYYY-MM-DD h:mm:ss A"),
                updatedAt: moment(availableData.updatedAt).format("YYYY-MM-DD h:mm:ss A"),
            }
            res.status(200).json({
                status: "success", responseMessage: "Fetch Successfully", responseData: data,
            });
        } else {
            res.status(422).json({
                status: "error", responseMessage: "No data found ", responseData: {},
            });
        };
    } catch (err) {
        console.error(err)
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {},
        });
    };
};

//Get  all course List
exports.getAllCourse = async (req, res) => {
    try {
        const course = await Course.find()
            .select("title description price duration image_url status createdAt updatedAt")
            .populate([{
                path: "category", select: "title description status image_url subcategories"
            }, {
                path: "teacher", select: "first_name last_name email role phone"
            }]).sort({ createdAt: -1 }).lean();
        if (course && course.length > 0) {
            res.status(200).json({
                status: "success",
                counts: course.length,
                responseMessage: "Successfully",
                responseData: course,
            });
        } else {
            res.status(404).json({ status: "error", responseMessage: "Courses Not Found", responseData: {} })
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {}
        });
    }
};

/// Get STUDENT Transaction list////
exports.studentTransactionList = async (req, res) => {
    try {
        const transactionList = await Payment.find({ student: req.user._id })
            .select("customer_id name userEmail amount status createdAt updatedAt")
            .populate([
                {
                    path: "course_id", select: "title description price duration image_url",
                    populate: { path: "category", select: "title description image_url" }
                },
                { path: "teacher_id", select: "first_name last_name email role phone" },
                { path: "coupon_id", select: "code amount_off start_date end_date" },
                { path: "student", select: "first_name last_name email role phone account_info" }
            ])
            .sort({ createdAt: -1 })
            .lean();
        if (transactionList && transactionList.length > 0) {
            const totalAmount = transactionList.reduce((
                sum, transactionLists) => sum + transactionLists.amount, 0
            ); //total transtion
            res.status(200).json({
                status: "success",
                counts: transactionList.length,
                totalPay: totalAmount,
                responseMessage: "Successfully",
                responseData: transactionList,
            });
        } else {
            res.status(404).json({ status: "error", responseMessage: "Payment List Not Found", responseData: {} });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {}
        });
    };
}

////Get Student Profile details///
exports.studentProfileDetails = async (req, res) => {
    try {
        let studentData = await User.findById(req.user._id).lean();
        if (studentData) {
            const data = {
                _id: studentData._id,
                first_name: studentData.first_name,
                last_name: studentData.last_name,
                email: studentData.email,
                phone: studentData.phone,
                role: studentData.role,
                status: studentData.account_info.status,
                createdAt: moment(studentData.createdAt).format("YYYY-MM-DD h:mm:ss A"),
                updatedAt: moment(studentData.updatedAt).format("YYYY-MM-DD h:mm:ss A")
            }
            res.status(200).json({
                status: "success", responseMessage: "Fetch Successfully", responseData: data,
            });
        } else {
            res.status(422).json({
                status: "error", responseMessage: "No data found ", responseData: {},
            });
        };
    } catch (err) {
        console.error(err)
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {},
        });
    };
};

//EditStudentDetails
exports.updateStudentProfile = async (req, res) => {
    try {
        const rules = { first_name: "required", last_name: "required", email: "required", phone: "required|digits_between:10,14" };
        const validation = new Validator(req.body, rules);
        if (validation.fails()) {
            res.status(422).json({
                status: "error", responseMessage: "Validation Error", responseData: validation.errors.all(),
            });
        } else {
            const { first_name, last_name, email, phone } = req.body;
            const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!regex.test(email)) {
                res.status(400).json({
                    status: "error", responseMessage: "Invalid email address", responseData: {}
                });
            }
            let user = await User.findById(req.user._id).lean();
            if (user) {
                let updateData = {
                    first_name: first_name,
                    last_name: last_name,
                    email: email,
                    phone: phone
                }
                const data = await User.findByIdAndUpdate({ _id: user._id }, updateData, { new: true });
                res.status(200).json({
                    status: "success", responseMessage: " Expert Details Updated Successfully", responseData: data
                });
            } else {
                res.status(404).json({
                    status: "error", responseMessage: "Availability not found", responseData: {}
                });
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {}
        });
    }
};


