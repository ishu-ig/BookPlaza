const User       = require("../models/User")
const cloudinary = require("../cloudinary")
const mailer     = require("../mailer/index")
const bcrypt     = require("bcrypt")
const jwt        = require("jsonwebtoken")
const passwordValidator = require('password-validator')

const schema = new passwordValidator()
schema
    .is().min(8).is().max(100)
    .has().uppercase(1).has().lowercase(1).has().digits(1)
    .has().not().spaces()
    .is().not().oneOf(['Passw0rd', 'Password123'])

// ─── Helper ───────────────────────────────────────────────────────────────────
// picPublicId is stored as "bookplaza/user/filename" (full Cloudinary path).
// Skip deletion for empty strings or old local-disk paths.
async function destroyCloudinaryFile(picPublicId) {
    if (!picPublicId) return
    if (picPublicId.startsWith("public/") || picPublicId.startsWith("uploads/")) return
    try {
        await cloudinary.uploader.destroy(picPublicId)
    } catch (err) {
        console.error("Cloudinary destroy error:", err)
    }
}

// multer-storage-cloudinary stores the full folder path in req.file.path (URL)
// and the public_id WITHOUT folder in req.file.filename.
// We need the full public_id WITH folder for deletion, so we build it here.
function getPublicId(req) {
    if (!req.file) return null
    // req.file.path is the full Cloudinary URL:
    // https://res.cloudinary.com/<cloud>/image/upload/v123/bookplaza/user/filename
    // Extract everything after "/upload/v<version>/"
    try {
        const url   = req.file.path
        const match = url.match(/\/upload\/v\d+\/(.+)$/)
        if (match) {
            // Remove file extension — Cloudinary public_ids have no extension
            return match[1].replace(/\.[^/.]+$/, "")
        }
    } catch (_) {}
    // Fallback: use filename only (may miss folder prefix)
    return req.file.filename
}

// ─── createRecord ─────────────────────────────────────────────────────────────
async function createRecord(req, res) {
    if (!schema.validate(req.body.password)) {
        await destroyCloudinaryFile(getPublicId(req))
        return res.status(400).send({
            result: "Fail",
            reason: "Invalid Password. Must have 1 uppercase, 1 lowercase, 1 digit, no spaces, 8–100 chars."
        })
    }
    try {
        const hash = await bcrypt.hash(req.body.password, 12)
        let data   = new User(req.body)
        data.role     = "Buyer"
        data.password = hash
        if (req.file) {
            data.pic         = req.file.path   // full Cloudinary HTTPS URL
            data.picPublicId = getPublicId(req) // full public_id with folder
        }
        await data.save()
        res.send({ result: "Done", data })
    } catch (error) {
        await destroyCloudinaryFile(getPublicId(req))
        const errorMessage = buildValidationErrors(error)
        if (Object.keys(errorMessage).length === 0) {
            console.error("createRecord:", error)
            return res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
        }
        res.status(400).send({ result: "Fail", reason: errorMessage })
    }
}

// ─── getRecord ────────────────────────────────────────────────────────────────
async function getRecord(req, res) {
    try {
        const data = await User.find().sort({ _id: -1 })
        res.send({ result: "Done", count: data.length, data })
    } catch (error) {
        console.error("getRecord:", error)
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

// ─── getSingleRecord ──────────────────────────────────────────────────────────
async function getSingleRecord(req, res) {
    try {
        const data = await User.findOne({ _id: req.params._id })
        if (data) res.send({ result: "Done", data })
        else res.status(404).send({ result: "Fail", reason: "Record Not Found" })
    } catch (error) {
        console.error("getSingleRecord:", error)
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

// ─── updateRecord ─────────────────────────────────────────────────────────────
async function updateRecord(req, res) {
    const newPublicId = getPublicId(req) // compute before any early returns

    try {
        const data = await User.findOne({ _id: req.params._id })
        if (!data) {
            await destroyCloudinaryFile(newPublicId)
            return res.status(404).send({ result: "Fail", reason: "Record Not Found" })
        }

        data.name    = req.body.name    ?? data.name
        data.username= req.body.username?? data.username
        data.email   = req.body.email   ?? data.email
        data.phone   = req.body.phone   ?? data.phone
        data.address = req.body.address ?? data.address
        data.pin     = req.body.pin     ?? data.pin
        data.city    = req.body.city    ?? data.city
        data.state   = req.body.state   ?? data.state
        data.active  = req.body.active  ?? data.active

        if (req.file) {
            // Delete old image from Cloudinary (safe — skips old local paths)
            await destroyCloudinaryFile(data.picPublicId)
            data.pic         = req.file.path  // new Cloudinary HTTPS URL
            data.picPublicId = newPublicId    // new full public_id with folder
        }

        await data.save()
        res.send({ result: "Done", data })

    } catch (error) {
        await destroyCloudinaryFile(newPublicId)
        const errorMessage = {}
        if (error.keyValue?.username) errorMessage.username = "User with this username already exists"
        if (error.keyValue?.email)    errorMessage.email    = "User with this email already exists"
        if (Object.keys(errorMessage).length === 0) {
            console.error("updateRecord:", error)
            return res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
        }
        res.status(400).send({ result: "Fail", reason: errorMessage })
    }
}

// ─── deleteRecord ─────────────────────────────────────────────────────────────
async function deleteRecord(req, res) {
    try {
        const data = await User.findOne({ _id: req.params._id })
        if (!data) return res.status(404).send({ result: "Fail", reason: "Record Not Found" })
        await destroyCloudinaryFile(data.picPublicId)
        await data.deleteOne()
        res.send({ result: "Done", data })
    } catch (error) {
        console.error("deleteRecord:", error)
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

// ─── login ────────────────────────────────────────────────────────────────────
async function login(req, res) {
    try {
        const data = await User.findOne({
            $or: [{ username: req.body.username }, { email: req.body.username }]
        })
        if (!data || !(await bcrypt.compare(req.body.password, data.password))) {
            return res.status(401).send({ result: "Fail", reason: "Invalid username or password" })
        }
        if (data.active === false) {
            return res.status(403).send({ result: "Fail", reason: "Your account has been deactivated" })
        }
        const key = data.role === "Buyer"
            ? process.env.JWT_SECRET_KEY_BUYER
            : process.env.JWT_SECRET_KEY_ADMIN
        const token = await new Promise((resolve, reject) => {
            jwt.sign({ data }, key, { expiresIn: "15d" }, (err, tok) =>
                err ? reject(err) : resolve(tok)
            )
        })
        res.send({ result: "Done", data, token })
    } catch (error) {
        console.error("login:", error)
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

// ─── forgetPassword1 (send OTP) ───────────────────────────────────────────────
async function forgetPassword1(req, res) {
    try {
        const data = await User.findOne({
            $or: [{ username: req.body.username }, { email: req.body.username }]
        })
        if (!data) return res.status(404).send({ result: "Fail", reason: "User not found" })

        const otp      = Math.floor(100000 + Math.random() * 900000)
        data.otp       = String(otp)
        data.otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 min
        await data.save()

        mailer.sendMail({
            from:    process.env.MAIL_SENDER,
            to:      data.email,
            subject: `OTP for Password Reset — Team ${process.env.SITE_NAME}`,
            html: `
                <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:20px;border:1px solid #ddd;border-radius:10px;background:#f9f9f9;">
                    <h2 style="text-align:center;color:#333;">Password Reset Request</h2>
                    <p>Hello <strong>${data.name}</strong>,</p>
                    <p>You requested a password reset.</p>
                    <div style="text-align:center;font-size:18px;font-weight:bold;padding:10px;background:#f3f3f3;border-radius:5px;">
                        Your OTP: <span style="color:#d32f2f;font-size:22px;">${otp}</span>
                    </div>
                    <p style="color:#d32f2f;text-align:center;font-size:14px;">Do not share this OTP. It expires in 10 minutes.</p>
                    <p>Regards,<br/><strong>Team ${process.env.SITE_NAME}</strong></p>
                </div>`
        }, (err) => { if (err) console.error("Mail error:", err) })

        res.send({ result: "Done", message: "OTP sent to your registered email" })
    } catch (error) {
        console.error("forgetPassword1:", error)
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

// ─── forgetPassword2 (verify OTP) ────────────────────────────────────────────
async function forgetPassword2(req, res) {
    try {
        const data = await User.findOne({
            $or: [{ username: req.body.username }, { email: req.body.username }]
        })
        if (!data) return res.status(401).send({ result: "Fail", reason: "Unauthorized activity" })
        if (!data.otp || (data.otpExpiry && new Date() > data.otpExpiry))
            return res.status(400).send({ result: "Fail", reason: "OTP has expired. Please request a new one." })
        if (String(data.otp) !== String(req.body.otp))
            return res.status(400).send({ result: "Fail", reason: "Invalid OTP" })
        res.send({ result: "Done" })
    } catch (error) {
        console.error("forgetPassword2:", error)
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

// ─── forgetPassword3 (reset password) ────────────────────────────────────────
async function forgetPassword3(req, res) {
    try {
        const data = await User.findOne({
            $or: [{ username: req.body.username }, { email: req.body.username }]
        })
        if (!data) return res.status(401).send({ result: "Fail", reason: "Unauthorized activity" })
        if (!data.otp || String(data.otp) !== String(req.body.otp))
            return res.status(401).send({ result: "Fail", reason: "Unauthorized activity" })
        if (data.otpExpiry && new Date() > data.otpExpiry)
            return res.status(400).send({ result: "Fail", reason: "OTP has expired. Please request a new one." })
        if (!schema.validate(req.body.password))
            return res.status(400).send({
                result: "Fail",
                reason: "Invalid Password. Must have 1 uppercase, 1 lowercase, 1 digit, no spaces, 8–100 chars."
            })
        const hash     = await bcrypt.hash(req.body.password, 12)
        data.password  = hash
        data.otp       = null
        data.otpExpiry = null
        await data.save()
        res.send({ result: "Done", message: "Password reset successfully" })
    } catch (error) {
        console.error("forgetPassword3:", error)
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

// ─── Shared validation error builder ─────────────────────────────────────────
function buildValidationErrors(error) {
    const e = {}
    if (error.keyValue?.username)  e.username = "User with this username already exists"
    if (error.keyValue?.email)     e.email    = "User with this email already exists"
    if (error.errors?.name)        e.name     = error.errors.name.message
    if (error.errors?.username)    e.username = error.errors.username.message
    if (error.errors?.email)       e.email    = error.errors.email.message
    if (error.errors?.phone)       e.phone    = error.errors.phone.message
    if (error.errors?.password)    e.password = error.errors.password.message
    return e
}

module.exports = {
    createRecord, getRecord, getSingleRecord,
    updateRecord, deleteRecord, login,
    forgetPassword1, forgetPassword2, forgetPassword3,
}