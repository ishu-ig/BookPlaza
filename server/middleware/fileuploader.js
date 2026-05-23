const multer = require("multer")

function createUploader(folder) {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, `public/uploads/${folder}`)
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + file.originalname)
        }
    })

    return multer({ storage: storage })
}

module.exports = {
    categoryUploader: createUploader("category"),
    subcategoryUploader: createUploader("subcategory"),
    ebookFileUploader: createUploader("ebookFile"),
    testimonialUploader: createUploader("testimonial"),
    bookUploader: createUploader("book"),
    bannerUploader: createUploader("banner"),
    userUploader: createUploader("user")
}