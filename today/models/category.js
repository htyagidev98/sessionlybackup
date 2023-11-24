const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const SubcategorySchema = new Schema({
    sub_title: {
        type: String,
    },
    sub_description: {
        type: String,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    parent_id: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
    },
});

const CategorySchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image_url: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    subcategories: [SubcategorySchema],
}, { timestamps: true, toJSON: true });

CategorySchema.set("toObject", { virtuals: true });
CategorySchema.set('toJSON', { virtuals: true });

const Category = mongoose.model("Category", CategorySchema, "Category");
module.exports = Category;