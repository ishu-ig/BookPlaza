const mongoose = require("mongoose");

const PublisherSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Publisher name is required"],
            unique: true,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        website: {
            type: String,
            trim: true,
        },
        logo: {
            type: String,
            default: null,
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const Publisher = mongoose.model("Publisher", PublisherSchema);

module.exports = Publisher;