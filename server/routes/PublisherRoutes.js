const PublisherRouter = require("express").Router()
// const { publisherUploader } = require("../middleware/fileuploader")
const { verifyAdmin } = require("../middleware/authentication")
const {
    createRecord,
    getRecord,
    getSingleRecord,
    updateRecord,
    deleteRecord,
} = require("../controllers/PublisherController")

PublisherRouter.post("",verifyAdmin,   createRecord)
PublisherRouter.get("", getRecord)
PublisherRouter.get("/:_id", getSingleRecord)
PublisherRouter.put("/:_id", verifyAdmin,  updateRecord)
PublisherRouter.delete("/:_id",verifyAdmin,  deleteRecord)


module.exports = PublisherRouter