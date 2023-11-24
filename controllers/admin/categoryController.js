const Category = require('../../models/category')
const Validator = require("validatorjs"),
    moment = require("moment-timezone")
_ = require("lodash");

//////Category Add//////
exports.categoryAdd = async (req, res) => {
    try {
        const rules = { title: "required", description: "required" };
        const validation = new Validator(req.body, rules);
        if (validation.fails()) {
            res.status(422).json({
                status: "error", responseMessage: "Validation Error", responseData: validation.errors.all(),
            });
        } else {
            const { title, description, sub_title, sub_description } = req.body;
            let existingCategory = await Category.findOne({ title: title }).lean();
            if (!existingCategory) {
                const categoryPicturesFilename = req.file.filename;
                if (!req.file) {
                    res.status(422).json({
                        status: "error", responseMessage: "File not provided",
                    });
                }
                let newCategory = await Category.create({
                    title: title,
                    description: description,
                    image_url: `${process.env.API_DOMAIN}/category_pictures/${categoryPicturesFilename}`,
                })
                res.status(201).json({
                    status: "success", responseMessage: "Category Added Successfully",
                    responseData: newCategory
                });
            } else {
                let Subcategory = [];
                Subcategory.push({
                    sub_title: sub_title,
                    sub_description: sub_description,
                    parent_id: existingCategory._id
                });
                const categoryData = await Category.findByIdAndUpdate({ _id: existingCategory._id, }, { $push: { subcategories: Subcategory } },
                    { new: true });
                res.status(201).json({
                    status: "success", responseMessage: "Category Updated Successfully",
                    responseData: categoryData
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

//////GET All Category//////
exports.getAllCategory = async (req, res) => {
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
            status: "error",
            responseMessage: "Internal Server Error",
            responseData: {},
        });
    }
};

////////GET Category////////
exports.getCategory = async (req, res) => {
    try {
        const { _id } = req.query;
        const categoryData = await Category.findOne({ _id: _id })
            .populate('subcategories', 'sub_title sub_description parent_id').lean();
        if (categoryData) {
            res.status(200).json({
                status: "success", responseMessage: "Successfully", responseData: categoryData,
            });
        } else {
            res.status(404).json({ status: "error", responseMessage: "Category Not Found", responseData: {} });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {},
        });
    }
};

//////////Update Category/////////
exports.updateCategory = async (req, res) => {
    try {
        const rules = { title: "required", description: "required" };
        const validation = new Validator(req.body, rules);
        if (validation.fails()) {
            res.status(422).json({
                status: "error", responseMessage: "Validation Error", responseData: validation.errors.all(),
            });
        } else {
            const { title, description, image_url } = req.body;
            const { _id } = req.query;
            let categoryData = await Category.findById(_id).lean();
            if (categoryData) {
                let updateData = {
                    title: title,
                    description: description,
                    status: "active"
                }
                if (req.file) {
                    const categoryPicturesFilename = req.file.filename;
                    const imageURL = `${process.env.API_DOMAIN}/category_pictures/${categoryPicturesFilename}`;
                    updateData.image_url = imageURL;
                } else if (image_url) {
                    updateData.image_url = image_url
                }
                const data = await Category.findByIdAndUpdate({ _id: categoryData._id }, updateData,
                    { new: true });
                res.status(200).json({
                    status: "success", responseMessage: "Updated Successfully", responseData: data
                });

            } else {
                res.status(404).json({
                    status: "error", responseMessage: "Category not found", responseData: {}
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

////////Category Delete/////////
exports.deleteCategory = async (req, res) => {
    try {
        const { _id } = req.query;
        const deletedCategory = await Category.findOneAndUpdate({ _id: _id, status: "active" },
            { $set: { status: "inactive" }, }, { new: true });
        if (deletedCategory) {
            res.status(200).json({
                status: "success", responseMessage: 'Deleted Successfully', responseData: {}
            });
        } else {
            res.status(404).json({
                status: "error", responseMessage: 'Category Not Found', responseData: {}
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "error", responseMessage: 'Internal Server Error', responseData: {} });
    }
};



