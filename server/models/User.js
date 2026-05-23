const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Full Name is Mandatory"],
        trim: true
    },
    username: {
        type: String,
        unique: true,
        required: [true, "User Name is Mandatory"],
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Email Address is Mandatory"],
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: [true, "Phone Number is Mandatory"],
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is Mandatory"]
    },
    role: {
        type: String,
        enum: ["Buyer", "Admin", "Super Admin", "Delivery Boy"],
        default: "Buyer"
    },
    address:  { type: String, default: "" },
    pin:      { type: String, default: "" },
    city:     { type: String, default: "" },
    state:    { type: String, default: "" },
    pic:      { type: String, default: "" },

    // Stores Cloudinary public_id (with folder) for deletion
    // e.g. "bookplaza/user/1234567_filename"
    picPublicId: { type: String, default: "" },

    otp:       { type: String, default: null },
    otpExpiry: { type: Date,   default: null },

    active: { type: Boolean, default: true },

    // Delivery Boy fields
    vehicleNumber:    { type: String, default: "" },
    vehicleType: {
        type: String,
        enum: ["Bike", "Scooter", "Bicycle", "Van", ""],
        default: ""
    },
    currentOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Checkout" }],
    totalDeliveries: { type: Number, default: 0 }

}, { timestamps: true })

module.exports = mongoose.model("User", UserSchema)