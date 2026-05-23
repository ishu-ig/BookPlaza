const mongoose = require("mongoose")

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User Id is Mandatory"]
    },
    book: {                              // ← lowercase "book"
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: [true, "Book Id is Mandatory"]
    },
    format: {                            // ← add this
        type: String,
        enum: ["Paperback", "Hardcover", "Ebook"],
        required: [true, "Format is Mandatory"]
    },
    qty: {
        type: Number,
        required: [true, "Quantity is Mandatory"]
    },
    total: {
        type: Number,
        required: [true, "Price is Mandatory"]
    }
})

const Cart = mongoose.model("Cart", CartSchema)
module.exports = Cart