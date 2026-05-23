const mongoose = require("mongoose")

const SubcategorySchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: [true, "Subcategory Name Is Mendatory"]
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "Select Maincategory"]
    },
    pic: {
        type: String,
        required: [true, "Subcategory Pic Is Mendatory"]
    },
    active: {
        type: Boolean,
        default: true
    }
})

const Subcategory = new mongoose.model("Subcategory", SubcategorySchema)

module.exports = Subcategory 