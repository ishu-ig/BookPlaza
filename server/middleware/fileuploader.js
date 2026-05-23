// server/middleware/fileuploader.js

const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("../cloudinary")  // ← go up one folder

function createUploader(folder) {
    const storage = new CloudinaryStorage({
        cloudinary,
        params: {
            folder: `bookplaza/${folder}`,
            allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
            public_id: (req, file) => `${Date.now()}${file.originalname.split(".")[0]}`,
        },
    })
    return multer({ storage })
}

module.exports = {
    categoryUploader:    createUploader("category"),
    subcategoryUploader: createUploader("subcategory"),
    ebookFileUploader:   createUploader("ebookFile"),
    testimonialUploader: createUploader("testimonial"),
    bookUploader:        createUploader("book"),
    bannerUploader:      createUploader("banner"),
    userUploader:        createUploader("user"),
}