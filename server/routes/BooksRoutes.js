const BookRouter = require("express").Router()
const { bookUploader } = require("../middleware/fileuploader")
const { verifyAdmin, verifyBoth} = require("../middleware/authentication")
const {
    createRecord,
    getRecord,
    getSingleRecord,
    updateRecord,
    deleteRecord,
    addReview,
    deleteReview,
    getReviews,
} = require("../controllers/BookController")

const uploadFields = bookUploader.fields([
    { name: "pic",       maxCount: 1  },
    { name: "images",    maxCount: 10 },
    { name: "ebookFile", maxCount: 1  }, // ← add this
])

BookRouter.post("",      verifyAdmin, uploadFields, createRecord)
BookRouter.get("",       getRecord)
BookRouter.get("/:_id",  getSingleRecord)
BookRouter.put("/:_id",  verifyAdmin, uploadFields, updateRecord)
BookRouter.delete("/:_id", verifyAdmin, deleteRecord)

BookRouter.post("/:_id/reviews",             verifyBoth, addReview)
BookRouter.get("/:_id/reviews",              getReviews)
BookRouter.delete("/:_id/reviews/:reviewId", verifyBoth, deleteReview)

module.exports = BookRouter