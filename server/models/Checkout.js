const mongoose = require("mongoose");

/* ── Per-item sub-schema ─────────────────────────────────────── */
const OrderItemSchema = new mongoose.Schema(
    {
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
            required: [true, "Book reference is required"],
        },
        format: {
            type: String,
            enum: {
                values: ["Paperback", "Hardcover", "Ebook"],
                message: "Format must be Paperback, Hardcover, or Ebook",
            },
            required: [true, "Format is required"],
        },
        qty: {
            type: Number,
            required: [true, "Quantity is required"],
            min: [1, "Quantity must be at least 1"],
            default: 1,
        },
        total: {
            type: Number,
            required: [true, "Item total is required"],
            min: [0, "Total cannot be negative"],
        },
    },
    { _id: false }
);

/* ── Checkout schema ─────────────────────────────────────────── */
const CheckoutSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User Id is Mandatory"],
        },
        orderStatus: {
            type: String,
            enum: [
                "Ordered",
                "Processing",
                "Shipped",
                "Out For Delivery",
                "Delivered",
                "Cancelled",
            ],
            default: "Ordered",
        },
        paymentMode: {
            type: String,
            enum: ["COD", "Net Banking"],
            default: "COD",
        },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Done", "Failed", "Refunded"],
            default: "Pending",
        },
        subtotal: {
            type: Number,
            required: [true, "Subtotal is Mandatory"],
            min: 0,
        },
        shipping: {
            type: Number,
            required: [true, "Shipping is Mandatory"],
            min: 0,
            default: 0,
        },
        total: {
            type: Number,
            required: [true, "Total is Mandatory"],
            min: 0,
        },

        /* Books array — replaces the old untyped `products: []` */
        books: {
            type: [OrderItemSchema],
            default: [],
            validate: {
                validator: (v) => Array.isArray(v) && v.length > 0,
                message: "At least one book item is required",
            },
        },

        /* Razorpay payment id (kept for online payments) */
        rppid: {
            type: String,
            default: "",
        },

        deliveryBoy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

        /* Auto-set when an Ebook order is paid */
        ebookAccessGranted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

/* ── Virtual: does this order contain any ebook? ─────────────── */
CheckoutSchema.virtual("hasEbook").get(function () {
    return (this.Books || []).some((item) => item.format === "Ebook");
});

/* ── Virtual: is ebook accessible? ──────────────────────────── */
CheckoutSchema.virtual("ebookAccessible").get(function () {
    if (this.orderStatus === "Cancelled") return false;
    return (
        this.paymentStatus === "Done" ||
        this.paymentMode   === "COD"
    );
});

/* ── Index for fast user-order lookup ───────────────────────── */
CheckoutSchema.index({ user: 1, createdAt: -1 });

const Checkout = mongoose.model("Checkout", CheckoutSchema);
module.exports = Checkout;