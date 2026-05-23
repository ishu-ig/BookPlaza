const UserRouter = require("express").Router()
const { verifyBuyer, verifyAdmin } = require("../middleware/authentication")
const { userUploader } = require("../middleware/fileuploader")
const {
    createRecord, getRecord, getSingleRecord,
    updateRecord, deleteRecord, login,
    forgetPassword1, forgetPassword2, forgetPassword3,
} = require("../controllers/UserController")

// Specific routes MUST come before /:_id param routes
UserRouter.post("/login",            login)
UserRouter.post("/forgetPassword-1", forgetPassword1)
UserRouter.post("/forgetPassword-2", forgetPassword2)
UserRouter.post("/forgetPassword-3", forgetPassword3)
UserRouter.post("/",                 userUploader.single("pic"), createRecord)

UserRouter.get("/",                  getRecord)
UserRouter.get("/:_id",              getSingleRecord)
UserRouter.put("/:_id",              userUploader.single("pic"), updateRecord)
UserRouter.delete("/:_id",           deleteRecord)

module.exports = UserRouter