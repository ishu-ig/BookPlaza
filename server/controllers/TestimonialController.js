const Testimonial                     = require("../models/Testimonial");
const { deleteFromCloudinary }        = require("../cloudinaryMethods");

// ── CREATE ────────────────────────────────────────────────────────────────────
async function createRecord(req, res) {
    try {
        let data = new Testimonial(req.body);
        if (req.file) data.pic = req.file.path;

        await data.save();
        res.status(201).send({ result: "Done", data });

    } catch (error) {
        if (req.file) await deleteFromCloudinary(req.file.path);

        let errorMessage = {};
        if (error.errors?.name)    errorMessage.name    = error.errors.name.message;
        if (error.errors?.message) errorMessage.message = error.errors.message.message;
        if (error.errors?.pic)     errorMessage.pic     = error.errors.pic.message;

        if (Object.keys(errorMessage).length === 0) {
            console.error("Testimonial createRecord error:", error);
            return res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
        }
        res.status(400).send({ result: "Fail", reason: errorMessage });
    }
}

// ── GET ALL ───────────────────────────────────────────────────────────────────
async function getRecord(req, res) {
    try {
        const data = await Testimonial.find().sort({ _id: -1 });
        res.send({ result: "Done", count: data.length, data });

    } catch (error) {
        console.error("Testimonial getRecord error:", error);
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

// ── GET SINGLE ────────────────────────────────────────────────────────────────
async function getSingleRecord(req, res) {
    try {
        const data = await Testimonial.findById(req.params._id);

        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "Record Not Found" });
        }

        res.send({ result: "Done", data });

    } catch (error) {
        console.error("Testimonial getSingleRecord error:", error);
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

// ── UPDATE ────────────────────────────────────────────────────────────────────
async function updateRecord(req, res) {
    try {
        const data = await Testimonial.findById(req.params._id);

        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "Record Not Found" });
        }

        data.name    = req.body.name    ?? data.name;
        data.message = req.body.message ?? data.message;
        data.active  = req.body.active  ?? data.active;

        if (req.file) {
            await deleteFromCloudinary(data.pic); // delete old Cloudinary image
            data.pic = req.file.path;
        }

        await data.save();
        res.send({ result: "Done", data });

    } catch (error) {
        if (req.file) await deleteFromCloudinary(req.file.path); // clean up new upload

        let errorMessage = {};
        if (error.errors?.name)    errorMessage.name    = error.errors.name.message;
        if (error.errors?.message) errorMessage.message = error.errors.message.message;
        if (error.errors?.pic)     errorMessage.pic     = error.errors.pic.message;

        if (Object.keys(errorMessage).length === 0) {
            console.error("Testimonial updateRecord error:", error);
            return res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
        }
        res.status(400).send({ result: "Fail", reason: errorMessage });
    }
}

// ── DELETE ────────────────────────────────────────────────────────────────────
async function deleteRecord(req, res) {
    try {
        const data = await Testimonial.findById(req.params._id);

        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "Record Not Found" });
        }

        await deleteFromCloudinary(data.pic); // delete stored image
        await data.deleteOne();
        res.send({ result: "Done", data });

    } catch (error) {
        console.error("Testimonial deleteRecord error:", error);
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

module.exports = { createRecord, getRecord, getSingleRecord, updateRecord, deleteRecord };