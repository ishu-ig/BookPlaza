const Publisher = require("../models/Publisher");
const cloudinary = require("../cloudinary");

// ── Helper: safely delete a file from disk ────────────────────────────────────
function safeUnlink(filePath) {
    if (filePath) {
        try { fs.unlinkSync(filePath); } catch (_) {}
    }
}

// ── Helper: extract Mongoose / duplicate-key validation messages ──────────────
function extractValidationErrors(error) {
    const errorMessage = {};

    // Duplicate name (unique index violation)
    if (error.keyValue) {
        errorMessage.name = "A publisher with this name already exists";
    }

    const fields = ["name", "address", "contactEmail", "phone", "website", "logo"];
    fields.forEach(field => {
        if (error.errors?.[field]) {
            errorMessage[field] = error.errors[field].message;
        }
    });

    return errorMessage;
}

// ── CREATE ────────────────────────────────────────────────────────────────────
async function createRecord(req, res) {
    try {
        const data = new Publisher({
            name:         req.body.name,
            address:      req.body.address,
            email: req.body.email,
            phone:        req.body.phone,
            website:      req.body.website,
            active:       req.body.active,
            logo:         req.file?.path ?? null,
        });

        await data.save();
        res.status(201).send({ result: "Done", data });

    } catch (error) {
        safeUnlink(req.file?.path);

        const errorMessage = extractValidationErrors(error);
        if (Object.keys(errorMessage).length === 0) {
            console.error("createRecord error:", error);
            return res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
        }
        res.status(400).send({ result: "Fail", reason: errorMessage });
    }
}

// ── GET ALL ───────────────────────────────────────────────────────────────────
async function getRecord(req, res) {
    try {
        const filter = {};

        if (req.query.active !== undefined) {
            filter.active = req.query.active === "true";
        }

        const data = await Publisher.find(filter).sort({ _id: -1 });
        res.send({ result: "Done", count: data.length, data });

    } catch (error) {
        console.error("getRecord error:", error);
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

// ── GET SINGLE ────────────────────────────────────────────────────────────────
async function getSingleRecord(req, res) {
    try {
        const data = await Publisher.findById(req.params._id);

        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "Publisher Not Found" });
        }

        res.send({ result: "Done", data });

    } catch (error) {
        console.error("getSingleRecord error:", error);
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

// ── UPDATE ────────────────────────────────────────────────────────────────────
async function updateRecord(req, res) {
    try {
        const data = await Publisher.findById(req.params._id);

        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "Publisher Not Found" });
        }

        data.name         = req.body.name         ?? data.name;
        data.address      = req.body.address      ?? data.address;
        data.email = req.body.email ?? data.email;
        data.phone        = req.body.phone        ?? data.phone;
        data.website      = req.body.website      ?? data.website;
        data.active       = req.body.active       ?? data.active;

        // Replace logo only if a new file was uploaded
        if (req.file) {
            safeUnlink(data.logo);
            data.logo = req.file.path;
        }

        await data.save();
        res.send({ result: "Done", data });

    } catch (error) {
        safeUnlink(req.file?.path);

        const errorMessage = extractValidationErrors(error);
        if (Object.keys(errorMessage).length === 0) {
            console.error("updateRecord error:", error);
            return res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
        }
        res.status(400).send({ result: "Fail", reason: errorMessage });
    }
}

// ── DELETE ────────────────────────────────────────────────────────────────────
async function deleteRecord(req, res) {
    try {
        const data = await Publisher.findById(req.params._id);

        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "Publisher Not Found" });
        }

        safeUnlink(data.logo);

        await data.deleteOne();
        res.send({ result: "Done", data });

    } catch (error) {
        console.error("deleteRecord error:", error);
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

module.exports = {
    createRecord,
    getRecord,
    getSingleRecord,
    updateRecord,
    deleteRecord,
};