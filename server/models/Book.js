const mongoose = require("mongoose");

// ── Review Sub-schema ─────────────────────────────────────────────────────────
const ReviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
        },
        name: {
            type: String,
            default: "Anonymous",
            trim: true,
        },
        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: [1, "Minimum rating is 1"],
            max: [5, "Maximum rating is 5"],
        },
        comment: {
            type: String,
            required: [true, "Comment is required"],
            trim: true,
        },
    },
    { timestamps: true }
);

// ── Format Pricing Sub-schema ─────────────────────────────────────────────────
// Each selected format stores its own price, discount, and computed finalPrice.
const FormatPricingSchema = new mongoose.Schema(
    {
        format: {
            type: String,
            enum: {
                values: ["Paperback", "Hardcover", "Ebook"],
                message: "Format must be Paperback, Hardcover, or Ebook",
            },
            required: [true, "Format name is required"],
        },
        price: {
            type: Number,
            required: [true, "Price is required for each format"],
            min: [0, "Price cannot be negative"],
        },
        discount: {
            type: Number,
            default: 0,
            min: [0,   "Discount cannot be negative"],
            max: [100, "Discount cannot exceed 100%"],
        },
        finalPrice: {
            type: Number,
            required: [true, "Final price is required for each format"],
            min: [0, "Final price cannot be negative"],
        },
    },
    { _id: false }
);

// ── Book Schema ───────────────────────────────────────────────────────────────
const BookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Book title is required"],
            trim: true,
        },
        author: {
            type: String,
            required: [true, "Author name is required"],
            trim: true,
        },
        isbn: {
            type: String,
            required: [true, "ISBN is required"],
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
        },

        // ── Categorisation ────────────────────────────────────────────────────
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Category is required"],
        },
        subcategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subcategory",
            required: [true, "Subcategory is required"],
        },
        publisher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Publisher",
            required: [true, "Publisher is required"],
        },

        // ── Book details ──────────────────────────────────────────────────────
        language: {
            type: String,
            required: [true, "Language is required"],
            trim: true,
        },
        pages: {
            type: Number,
            required: [true, "Page count is required"],
        },
        publishedDate: {
            type: Date,
            default: null,
        },
        ebookFile:{
            type:String
        },

        // ── Format + per-format pricing ───────────────────────────────────────
        // Each entry: { format, price, discount, finalPrice }
        formatPricing: {
            type: [FormatPricingSchema],
            validate: {
                validator: function (v) {
                    return Array.isArray(v) && v.length > 0;
                },
                message: "At least one format with pricing is required",
            },
        },

        // ── Inventory ─────────────────────────────────────────────────────────
        stock: {
            type: Number,
            required: [true, "Stock is required"],
            default: 0,
            min: [0, "Stock cannot be negative"],
        },

        // ── Images ────────────────────────────────────────────────────────────
        pic: {
            type: String,
            required: [true, "Cover image is required"],
        },
        images: {
            type: [String],
            default: [],
        },

        // ── Flags ─────────────────────────────────────────────────────────────
        featured: {
            type: Boolean,
            default: false,
        },
        active: {
            type: Boolean,
            default: true,
        },

        // ── Ratings & Reviews ─────────────────────────────────────────────────
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        totalReviews: {
            type: Number,
            default: 0,
        },
        reviews: {
            type: [ReviewSchema],
            default: [],
        },
    },
    { timestamps: true }
);

// ── Instance method: recalculate average rating ───────────────────────────────
BookSchema.methods.recalcRating = function () {
    if (!this.reviews.length) {
        this.rating = 0;
        this.totalReviews = 0;
    } else {
        const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
        this.rating       = Math.round((sum / this.reviews.length) * 10) / 10;
        this.totalReviews = this.reviews.length;
    }
};

// ── Virtual: is the book in stock ────────────────────────────────────────────
BookSchema.virtual("inStock").get(function () {
    return this.stock > 0;
});

// ── Virtual: flat list of selected format names ───────────────────────────────
BookSchema.virtual("formats").get(function () {
    return (this.formatPricing || []).map(fp => fp.format);
});

// ── Index: fast search by title and author ────────────────────────────────────
BookSchema.index({ title: "text", author: "text" });

const Book = mongoose.model("Book", BookSchema);

module.exports = Book;