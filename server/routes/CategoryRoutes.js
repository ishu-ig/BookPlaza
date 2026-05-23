const CategoryRouter = require("express").Router()
const { categoryUploader } = require("../middleware/fileuploader")
const { verifyAdmin } = require("../middleware/authentication")
const {
    createRecord,
    getRecord,
    getSingleRecord,
    updateRecord,
    deleteRecord,
} = require("../controllers/CategoryController")

CategoryRouter.post("", verifyAdmin, categoryUploader.single("pic"), createRecord)
CategoryRouter.get("", getRecord)
CategoryRouter.get("/:_id", getSingleRecord)
CategoryRouter.put("/:_id",verifyAdmin, categoryUploader.single("pic"), updateRecord)
CategoryRouter.delete("/:_id",verifyAdmin, deleteRecord)


module.exports = CategoryRouter