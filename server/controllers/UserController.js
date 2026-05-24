const User              = require("../models/User");
const cloudinary        = require("../cloudinary");
const mailer            = require("../mailer/index");
const bcrypt            = require("bcrypt");
const jwt               = require("jsonwebtoken");
const passwordValidator = require("password-validator");

// ── Password policy ───────────────────────────────────────────────────────────
const schema = new passwordValidator();
schema
    .is().min(8).is().max(100)
    .has().uppercase(1).has().lowercase(1).has().digits(1)
    .has().not().spaces()
    .is().not().oneOf(["Passw0rd", "Password123"]);

// ── Cloudinary helpers ────────────────────────────────────────────────────────
/**
 * Extract full Cloudinary public_id (with folder) from a HTTPS URL.
 * e.g. https://res.cloudinary.com/<cloud>/image/upload/v123/bookplaza/user/filename.jpg
 *      → "bookplaza/user/filename"
 */
function getPublicId(req) {
    if (!req.file) return null;
    try {
        const url   = req.file.path;
        const match = url.match(/\/upload\/v\d+\/(.+)$/);
        if (match) return match[1].replace(/\.[^/.]+$/, "");
    } catch (_) {}
    return req.file.filename || null;
}

/**
 * Delete a file from Cloudinary by its public_id.
 * Skips old local-disk paths and empty values.
 */
async function destroyCloudinaryFile(picPublicId) {
    if (!picPublicId) return;
    if (picPublicId.startsWith("public/") || picPublicId.startsWith("uploads/")) return;
    try {
        await cloudinary.uploader.destroy(picPublicId);
    } catch (err) {
        console.error("Cloudinary destroy error:", err);
    }
}

// ── Shared validation error builder ──────────────────────────────────────────
function buildValidationErrors(error) {
    const e = {};
    if (error.keyValue?.username)  e.username = "User with this username already exists";
    if (error.keyValue?.email)     e.email    = "User with this email already exists";
    if (error.errors?.name)        e.name     = error.errors.name.message;
    if (error.errors?.username)    e.username = error.errors.username.message;
    if (error.errors?.email)       e.email    = error.errors.email.message;
    if (error.errors?.phone)       e.phone    = error.errors.phone.message;
    if (error.errors?.password)    e.password = error.errors.password.message;
    return e;
}

// ── CREATE ────────────────────────────────────────────────────────────────────
async function createRecord(req, res) {
    if (!schema.validate(req.body.password)) {
        await destroyCloudinaryFile(getPublicId(req));
        return res.status(400).send({
            result: "Fail",
            reason: "Invalid Password. Must have 1 uppercase, 1 lowercase, 1 digit, no spaces, 8–100 chars.",
        });
    }
    try {
        const hash = await bcrypt.hash(req.body.password, 12);
        let data   = new User(req.body);
        data.role     = "Buyer";
        data.password = hash;

        if (req.file) {
            data.pic         = req.file.path;   // full Cloudinary HTTPS URL
            data.picPublicId = getPublicId(req); // full public_id with folder
        }

        await data.save();
        res.status(201).send({ result: "Done", data });

    } catch (error) {
        await destroyCloudinaryFile(getPublicId(req));

        const errorMessage = buildValidationErrors(error);
        if (Object.keys(errorMessage).length === 0) {
            console.error("User createRecord error:", error);
            return res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
        }
        res.status(400).send({ result: "Fail", reason: errorMessage });
    }
}

// ── GET ALL ───────────────────────────────────────────────────────────────────
async function getRecord(req, res) {
    try {
        const data = await User.find().sort({ _id: -1 });
        res.send({ result: "Done", count: data.length, data });
    } catch (error) {
        console.error("User getRecord error:", error);
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

// ── GET SINGLE ────────────────────────────────────────────────────────────────
async function getSingleRecord(req, res) {
    try {
        const data = await User.findById(req.params._id);

        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "Record Not Found" });
        }

        res.send({ result: "Done", data });
    } catch (error) {
        console.error("User getSingleRecord error:", error);
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

// ── UPDATE ────────────────────────────────────────────────────────────────────
async function updateRecord(req, res) {
    const newPublicId = getPublicId(req); // compute before any early returns

    try {
        const data = await User.findById(req.params._id);

        if (!data) {
            await destroyCloudinaryFile(newPublicId);
            return res.status(404).send({ result: "Fail", reason: "Record Not Found" });
        }

        data.name     = req.body.name     ?? data.name;
        data.username = req.body.username ?? data.username;
        data.email    = req.body.email    ?? data.email;
        data.phone    = req.body.phone    ?? data.phone;
        data.address  = req.body.address  ?? data.address;
        data.pin      = req.body.pin      ?? data.pin;
        data.city     = req.body.city     ?? data.city;
        data.state    = req.body.state    ?? data.state;
        data.active   = req.body.active   ?? data.active;

        if (req.file) {
            await destroyCloudinaryFile(data.picPublicId); // delete old image
            data.pic         = req.file.path;
            data.picPublicId = newPublicId;
        }

        await data.save();
        res.send({ result: "Done", data });

    } catch (error) {
        await destroyCloudinaryFile(newPublicId); // clean up new upload on failure

        const errorMessage = {};
        if (error.keyValue?.username) errorMessage.username = "User with this username already exists";
        if (error.keyValue?.email)    errorMessage.email    = "User with this email already exists";

        if (Object.keys(errorMessage).length === 0) {
            console.error("User updateRecord error:", error);
            return res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
        }
        res.status(400).send({ result: "Fail", reason: errorMessage });
    }
}

// ── DELETE ────────────────────────────────────────────────────────────────────
async function deleteRecord(req, res) {
    try {
        const data = await User.findById(req.params._id);

        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "Record Not Found" });
        }

        await destroyCloudinaryFile(data.picPublicId);
        await data.deleteOne();
        res.send({ result: "Done", data });

    } catch (error) {
        console.error("User deleteRecord error:", error);
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
async function login(req, res) {
    try {
        const data = await User.findOne({
            $or: [{ username: req.body.username }, { email: req.body.username }],
        });

        if (!data || !(await bcrypt.compare(req.body.password, data.password))) {
            return res.status(401).send({ result: "Fail", reason: "Invalid username or password" });
        }

        if (data.active === false) {
            return res.status(403).send({ result: "Fail", reason: "Your account has been deactivated" });
        }

        const key = data.role === "Buyer"
            ? process.env.JWT_SECRET_KEY_BUYER
            : process.env.JWT_SECRET_KEY_ADMIN;

        const token = await new Promise((resolve, reject) => {
            jwt.sign({ data }, key, { expiresIn: "15d" }, (err, tok) =>
                err ? reject(err) : resolve(tok)
            );
        });

        res.send({ result: "Done", data, token });

    } catch (error) {
        console.error("User login error:", error);
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

// ── FORGET PASSWORD 1 — Send OTP ──────────────────────────────────────────────
async function forgetPassword1(req, res) {
    try {
        const data = await User.findOne({
            $or: [{ username: req.body.username }, { email: req.body.username }],
        });

        if (!data) return res.status(404).send({ result: "Fail", reason: "User not found" });

        const otp      = Math.floor(100000 + Math.random() * 900000);
        data.otp       = String(otp);
        data.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await data.save();

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
                </div>`,
        }, (err) => { if (err) console.error("Mail error:", err); });

        res.send({ result: "Done", message: "OTP sent to your registered email" });

    } catch (error) {
        console.error("User forgetPassword1 error:", error);
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

// ── FORGET PASSWORD 2 — Verify OTP ───────────────────────────────────────────
async function forgetPassword2(req, res) {
    try {
        const data = await User.findOne({
            $or: [{ username: req.body.username }, { email: req.body.username }],
        });

        if (!data) return res.status(401).send({ result: "Fail", reason: "Unauthorized activity" });

        if (!data.otp || (data.otpExpiry && new Date() > data.otpExpiry))
            return res.status(400).send({ result: "Fail", reason: "OTP has expired. Please request a new one." });

        if (String(data.otp) !== String(req.body.otp))
            return res.status(400).send({ result: "Fail", reason: "Invalid OTP" });

        res.send({ result: "Done" });

    } catch (error) {
        console.error("User forgetPassword2 error:", error);
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

// ── FORGET PASSWORD 3 — Reset Password ───────────────────────────────────────
async function forgetPassword3(req, res) {
    try {
        const data = await User.findOne({
            $or: [{ username: req.body.username }, { email: req.body.username }],
        });

        if (!data) return res.status(401).send({ result: "Fail", reason: "Unauthorized activity" });

        if (!data.otp || String(data.otp) !== String(req.body.otp))
            return res.status(401).send({ result: "Fail", reason: "Unauthorized activity" });

        if (data.otpExpiry && new Date() > data.otpExpiry)
            return res.status(400).send({ result: "Fail", reason: "OTP has expired. Please request a new one." });

        if (!schema.validate(req.body.password))
            return res.status(400).send({
                result: "Fail",
                reason: "Invalid Password. Must have 1 uppercase, 1 lowercase, 1 digit, no spaces, 8–100 chars.",
            });

        data.password  = await bcrypt.hash(req.body.password, 12);
        data.otp       = null;
        data.otpExpiry = null;
        await data.save();

        res.send({ result: "Done", message: "Password reset successfully" });

    } catch (error) {
        console.error("User forgetPassword3 error:", error);
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

module.exports = {
    createRecord, getRecord, getSingleRecord,
    updateRecord, deleteRecord, login,
    forgetPassword1, forgetPassword2, forgetPassword3,
};