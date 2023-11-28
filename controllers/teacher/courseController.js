const Course = require('../../models/course');
const Validator = require("validatorjs")
moment = require("moment-timezone")
_ = require("lodash");

/////////Course Add Api///////
exports.courseAdd = async (req, res) => {
    try {
        const rules = { title: "required", description: "required", category: "required", price: "required", duration: "required" };
        const validation = new Validator(req.body, rules);
        if (validation.fails()) {
            res.status(422).json({
                status: "error", responseMessage: "Validation Error", responseData: validation.errors.all(),
            });
        } else {
            const { title, description, price, category, duration } = req.body;
            const courseExist = await Course.findOne({ title: title }).lean();
            if (!courseExist) {
                const coursePicturesFilename = req.file.filename;
                if (!req.file) {
                    res.status(422).json({
                        status: "error", responseMessage: "File not provided",
                    });
                }
                let courseData = await Course.create({
                    teacher: req.user._id,
                    title: title,
                    price: parseFloat(price).toFixed(2),
                    description: description,
                    duration: duration,
                    category: category,
                    image_url: `${process.env.API_DOMAIN}/course_pictures/${coursePicturesFilename}`
                });
                res.status(201).json({
                    status: "success", responseMessage: " Course Add Successfully", responseData: courseData
                });
            } else {
                res.status(403).json({
                    status: "error", responseMessage: "Course Exist", responseData: {}
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

////////GET All Course  api////////
exports.getAllCourse = async (req, res) => {
    try {
        const courseData = await Course.find({ teacher: req.user._id })
            .select("title description price duration status image_url createdAt updatedAt")
            .populate([
                { path: "category", select: "title description status image_url subcategories" },
                { path: "teacher", select: "first_name last_name email role phone" },
            ])
            .sort({ createdAt: -1 })
            .lean();
        if (courseData && courseData.length > 0) {
            res.status(200).json({
                status: "success",
                counts: courseData.length,
                responseMessage: "Successfully",
                responseData: courseData,
            });
        } else {
            res.status(404).json({ status: "error", responseMessage: "Courses Not Found", responseData: {} });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            responseMessage: "Internal Server Error",
            responseData: {},
        });
    }
};

//////////GET Course//////
exports.getCourse = async (req, res) => {
    try {
        const { _id } = req.query;
        const course = await Course.findOne({ _id: _id }).populate([
            { path: "category", select: "title description status image_url subcategories" },
            { path: "teacher", select: "first_name last_name email role phone" }
        ]).lean();
        if (course) {
            let courseData = {
                _id: course._id,
                title: course.title,
                description: course.description,
                price: course.price,
                duration: course.duration,
                image_url: course.image_url,
                status: course.status,
                teacher: course.teacher,
                category: course.category,
                createdAt: moment(course.createdAt).format("DD-MM-YYYY h:mm:ss A"),
                updatedAt: moment(course.updatedAt).format("DD-MM-YYYY h:mm:ss A"),
            };
            res.status(200).json({
                status: "success", responseMessage: "Successfully", responseData: courseData,
            });
        } else {
            res.status(404).json({ status: "error", responseMessage: "Course Not Found", responseData: {} });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {},
        });
    }
};

////////Course Update api /////////
exports.updateCourse = async (req, res) => {
    try {
        const rules = { title: "required", description: "required", category: "required", price: "required", duration: "required" };
        const validation = new Validator(req.body, rules);
        if (validation.fails()) {
            res.status(422).json({
                status: "error", responseMessage: "Validation Error", responseData: validation.errors.all(),
            });
        } else {
            const { title, description, price, category, duration, image_url } = req.body; // If there is no file but an image_url is provided in the req body..
            const { _id } = req.query;
            let courseData = await Course.findById(_id).lean();
            if (courseData) {
                let updateData = {
                    title: title,
                    description: description,
                    price: parseFloat(price).toFixed(2),
                    category: category,
                    duration: duration,
                    status: "active"
                }
                if (req.file) {
                    const coursePicturesFilename = req.file.filename;
                    const imageURL = `${process.env.API_DOMAIN}/course_pictures/${coursePicturesFilename}`;
                    updateData.image_url = imageURL;
                } else if (image_url) { 
                    updateData.image_url = image_url
                }
                const data = await Course.findByIdAndUpdate({ _id: courseData._id },
                    updateData, { new: true });
                res.status(200).json({
                    status: "success", responseMessage: "Update Successfully", responseData: data
                });
            } else {
                res.status(404).json({
                    status: "error", responseMessage: "Course not found", responseData: {}
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

////////Course Delete////////
exports.deleteCourse = async (req, res) => {
    try {
        const { _id } = req.query;
        const deletedCourse = await Course.findOneAndUpdate({ _id: _id, status: "active" },
            { $set: { status: "inactive" }, }, { new: true });
        if (deletedCourse) {
            res.status(200).json({
                status: "success",
                responseMessage: 'Deleted Successfully',
                responseData: {}
            });
        } else {
            res.status(404).json({
                status: "error",
                responseMessage: 'Course Not FOund',
                responseData: {}
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "error", responseMessage: 'Internal Server Error', responseData: {} });
    }
};