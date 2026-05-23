const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("../cloudinary")

function createUploader(folder) {
    const storage = new CloudinaryStorage({
        cloudinary,
        params: async (req, file) => {
            const cleanName = file.originalname
                .replace(/\s+/g, '_')
                .replace(/[()]/g, '')
                .replace(/[^a-zA-Z0-9._-]/g, '')

            const isPdf = file.mimetype === 'application/pdf'

            return {
                folder: `bookplaza/${folder}`,
                allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
                resource_type: isPdf ? 'raw' : 'image',
                public_id: `${Date.now()}${cleanName.split(".")[0]}`,
            }
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