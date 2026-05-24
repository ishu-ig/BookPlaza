const Book                            = require("../models/Book");
const { deleteFromCloudinary }        = require("../cloudinaryMethods");

// ── Helpers ───────────────────────────────────────────────────────────────────
function extractValidationErrors(error) {
    const errorMessage = {};
    Object.keys(error.errors || {}).forEach(key => {
        const topLevel = key.split(".")[0];
        if (!errorMessage[topLevel]) {
            errorMessage[topLevel] = error.errors[key].message;
        }
    });
    return errorMessage;
}

function computeFinalPrice(price, discount = 0) {
    return Math.round(price * (1 - discount / 100) * 100) / 100;
}

function getUploadedFiles(req) {
    const files = req.files || {};
    return {
        picPath:       files.pic?.[0]?.path       || null,
        imagesPaths:   (files.images || []).map(f => f.path),
        ebookFilePath: files.ebookFile?.[0]?.path || null,
    };
}

async function cleanupUploadedFiles(req) {
    const { picPath, imagesPaths, ebookFilePath } = getUploadedFiles(req);
    if (picPath)       await deleteFromCloudinary(picPath);
    for (const p of imagesPaths) await deleteFromCloudinary(p);
    if (ebookFilePath) await deleteFromCloudinary(ebookFilePath);
}

function parseFormatPricing(raw) {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.map(fp => ({
            format:     fp.format,
            price:      Number(fp.price)    || 0,
            discount:   Number(fp.discount) || 0,
            finalPrice: computeFinalPrice(Number(fp.price), Number(fp.discount)),
        }));
    } catch {
        return [];
    }
}

// ── CREATE ────────────────────────────────────────────────────────────────────
async function createRecord(req, res) {
    try {
        const {
            title, author, isbn, description,
            category, subcategory, publisher,
            language, pages, publishedDate,
            stock, featured, active,
        } = req.body;

        const formatPricing = parseFormatPricing(req.body.formatPricing);
        if (!formatPricing.length) {
            await cleanupUploadedFiles(req);
            return res.status(400).send({ result: "Fail", reason: { formatPricing: "At least one format with pricing is required" } });
        }

        const { picPath, imagesPaths, ebookFilePath } = getUploadedFiles(req);

        const data = new Book({
            title, author, isbn, description,
            category, subcategory, publisher,
            language, pages, formatPricing,
            publishedDate: publishedDate || null,
            stock, featured, active,
            pic:       picPath,
            images:    imagesPaths,
            ebookFile: ebookFilePath,
        });

        await data.save();

        const finalData = await Book.findById(data._id)
            .populate("category",    ["name"])
            .populate("subcategory", ["name"])
            .populate("publisher",   ["name"]);

        res.status(201).send({ result: "Done", data: finalData });

    } catch (error) {
        await cleanupUploadedFiles(req);

        const errorMessage = extractValidationErrors(error);
        if (Object.keys(errorMessage).length === 0) {
            console.error("Book createRecord error:", error);
            return res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
        }
        res.status(400).send({ result: "Fail", reason: errorMessage });
    }
}

// ── GET ALL ───────────────────────────────────────────────────────────────────
async function getRecord(req, res) {
    try {
        const filter = {};

        if (req.query.active      !== undefined) filter.active      = req.query.active      === "true";
        if (req.query.featured    !== undefined) filter.featured    = req.query.featured    === "true";
        if (req.query.category)                  filter.category    = req.query.category;
        if (req.query.subcategory)               filter.subcategory = req.query.subcategory;
        if (req.query.publisher)                 filter.publisher   = req.query.publisher;
        if (req.query.language)                  filter.language    = req.query.language;

        if (req.query.format) {
            filter["formatPricing.format"] = {
                $in: req.query.format.split(",").map(s => s.trim()),
            };
        }

        if (req.query.minPrice || req.query.maxPrice) {
            filter["formatPricing.finalPrice"] = {};
            if (req.query.minPrice) filter["formatPricing.finalPrice"].$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) filter["formatPricing.finalPrice"].$lte = Number(req.query.maxPrice);
        }

        if (req.query.search) {
            filter.$text = { $search: req.query.search };
        }

        const page  = parseInt(req.query.page)  || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip  = (page - 1) * limit;

        const [data, total] = await Promise.all([
            Book.find(filter)
                .sort({ _id: -1 })
                .skip(skip)
                .limit(limit)
                .populate("category",    ["name"])
                .populate("subcategory", ["name"])
                .populate("publisher",   ["name"]),
            Book.countDocuments(filter),
        ]);

        res.send({ result: "Done", count: data.length, total, page, data });

    } catch (error) {
        console.error("Book getRecord error:", error);
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

// ── GET SINGLE ────────────────────────────────────────────────────────────────
async function getSingleRecord(req, res) {
    try {
        const data = await Book.findById(req.params._id)
            .populate("category",     ["name"])
            .populate("subcategory",  ["name"])
            .populate("publisher",    ["name"])
            .populate("reviews.user", ["name", "email"]);

        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "Book Not Found" });
        }

        res.send({ result: "Done", data });

    } catch (error) {
        console.error("Book getSingleRecord error:", error);
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

// ── UPDATE ────────────────────────────────────────────────────────────────────
async function updateRecord(req, res) {
    try {
        const existing = await Book.findById(req.params._id).lean();

        if (!existing) {
            await cleanupUploadedFiles(req);
            return res.status(404).send({ result: "Fail", reason: "Book Not Found" });
        }

        const formatPricing = req.body.formatPricing
            ? parseFormatPricing(req.body.formatPricing)
            : existing.formatPricing || [];

        if (!formatPricing.length) {
            await cleanupUploadedFiles(req);
            return res.status(400).send({ result: "Fail", reason: { formatPricing: "At least one format with pricing is required" } });
        }

        const { picPath, imagesPaths, ebookFilePath } = getUploadedFiles(req);

        const updatePayload = {
            title:         req.body.title         ?? existing.title,
            author:        req.body.author        ?? existing.author,
            isbn:          req.body.isbn          ?? existing.isbn,
            description:   req.body.description   ?? existing.description,
            category:      req.body.category      ?? existing.category,
            subcategory:   req.body.subcategory   ?? existing.subcategory,
            publisher:     req.body.publisher     ?? existing.publisher,
            language:      req.body.language      ?? existing.language,
            pages:         req.body.pages         ?? existing.pages,
            formatPricing,
            publishedDate: req.body.publishedDate ?? existing.publishedDate,
            stock:         req.body.stock         ?? existing.stock,
            featured:      req.body.featured      ?? existing.featured,
            active:        req.body.active        ?? existing.active,
            pic:           existing.pic,
            images:        existing.images || [],
            ebookFile:     ebookFilePath || existing.ebookFile || null,
        };

        if (picPath) {
            await deleteFromCloudinary(existing.pic); // delete old cover image
            updatePayload.pic = picPath;
        }

        if (imagesPaths.length > 0) {
            for (const oldImg of (existing.images || [])) await deleteFromCloudinary(oldImg);
            updatePayload.images = imagesPaths;
        }

        if (ebookFilePath && existing.ebookFile) {
            await deleteFromCloudinary(existing.ebookFile); // delete old ebook
        }

        const finalData = await Book.findByIdAndUpdate(
            req.params._id,
            updatePayload,
            { new: true, runValidators: true }
        )
            .populate("category",    ["name"])
            .populate("subcategory", ["name"])
            .populate("publisher",   ["name"]);

        res.send({ result: "Done", data: finalData });

    } catch (error) {
        await cleanupUploadedFiles(req);

        const errorMessage = extractValidationErrors(error);
        if (Object.keys(errorMessage).length === 0) {
            console.error("Book updateRecord error:", error);
            return res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
        }
        res.status(400).send({ result: "Fail", reason: errorMessage });
    }
}

// ── DELETE ────────────────────────────────────────────────────────────────────
async function deleteRecord(req, res) {
    try {
        const data = await Book.findById(req.params._id);

        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "Book Not Found" });
        }

        await deleteFromCloudinary(data.pic);
        for (const img of (data.images || [])) await deleteFromCloudinary(img);
        if (data.ebookFile) await deleteFromCloudinary(data.ebookFile);

        await data.deleteOne();
        res.send({ result: "Done", data });

    } catch (error) {
        console.error("Book deleteRecord error:", error);
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

// ── ADD REVIEW ────────────────────────────────────────────────────────────────
async function addReview(req, res) {
    try {
        const { rating, comment } = req.body;

        if (!comment || comment.trim() === "") {
            return res.status(400).send({ result: "Fail", reason: "Comment is required" });
        }

        const parsedRating = Number(rating);
        if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            return res.status(400).send({ result: "Fail", reason: "Rating must be between 1 and 5" });
        }

        const data = await Book.findById(req.params._id);
        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "Book Not Found" });
        }

        const userId   = req.user?._id?.toString();
        const userName = req.user?.name || "Anonymous";

        if (!userId) {
            return res.status(401).send({ result: "Fail", reason: "User identification required to post a review" });
        }

        const alreadyReviewed = data.reviews.some(r => r.user?.toString() === userId);
        if (alreadyReviewed) {
            return res.status(400).send({ result: "Fail", reason: "You have already reviewed this book" });
        }

        data.reviews.push({ user: userId, name: userName, rating: parsedRating, comment: comment.trim() });
        data.recalcRating();
        await data.save();

        res.status(201).send({
            result:        "Done",
            reviewCount:   data.reviews.length,
            averageRating: data.rating,
            reviews:       data.reviews,
        });

    } catch (error) {
        console.error("Book addReview error:", error);
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

// ── DELETE REVIEW ─────────────────────────────────────────────────────────────
async function deleteReview(req, res) {
    try {
        const { _id, reviewId } = req.params;

        const data = await Book.findById(_id);
        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "Book Not Found" });
        }

        const reviewIndex = data.reviews.findIndex(r => r._id.toString() === reviewId);
        if (reviewIndex === -1) {
            return res.status(404).send({ result: "Fail", reason: "Review Not Found" });
        }

        const requesterId = req.user?._id?.toString();
        const isOwner     = data.reviews[reviewIndex].user?.toString() === requesterId;
        const isAdmin     = req.user?.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).send({ result: "Fail", reason: "Not authorized to delete this review" });
        }

        data.reviews.splice(reviewIndex, 1);
        data.recalcRating();
        await data.save();

        res.send({
            result:        "Done",
            reviewCount:   data.reviews.length,
            averageRating: data.rating,
            reviews:       data.reviews,
        });

    } catch (error) {
        console.error("Book deleteReview error:", error);
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

// ── GET REVIEWS ───────────────────────────────────────────────────────────────
async function getReviews(req, res) {
    try {
        const data = await Book.findById(req.params._id)
            .select("reviews rating totalReviews")
            .populate("reviews.user", ["name", "email"]);

        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "Book Not Found" });
        }

        res.send({
            result:        "Done",
            reviewCount:   data.reviews.length,
            averageRating: data.rating,
            reviews:       data.reviews,
        });

    } catch (error) {
        console.error("Book getReviews error:", error);
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

module.exports = {
    createRecord, getRecord, getSingleRecord,
    updateRecord, deleteRecord,
    addReview, deleteReview, getReviews,
};