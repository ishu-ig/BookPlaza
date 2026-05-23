const mongoose = require("mongoose")

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: [true, "Category Name is Mendatory"]
    },
    pic: {
        type: String,
        required: [true, "Category Pic is Mendatory"]
    },
    active: {
        type: Boolean,
        default: true
    },
})
const Category = new mongoose.model("Category", CategorySchema)

module.exports = Category