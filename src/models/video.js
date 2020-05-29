const mongoose = require("mongoose");

const schema = mongoose.Schema(
    {
        url: {
            type: String,
        },
        title: {
            type: String,
            // required: true,
        },
        description: {
            type: String,
            default: "Required a description...",
        },
        category: {
            type: Array,
        },
        ageRestriction: {
            type: Boolean,
            default: false,
        },
        thumbnail: {
            type: String,
        },
        views: {
            type: Number,
            default: 0,
        },
        like: [
            {
                type: mongoose.Types.ObjectId,
                ref: "User",
            },
        ],
        dislike: [
            {
                type: mongoose.Types.ObjectId,
                ref: "User",
            },
        ],
        comments: [
            {
                poster: {
                    type: mongoose.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                comment: { type: String, required: true },
                reply: { type: Array },
                createdAt: {
                    type: Date,
                    default: Date.now(),
                },
            },
        ],
        poster: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true,
        },
        bullets: [
            {
                content: { type: String, required: true },
                time: { type: Number, required: true },
                user: {
                    type: mongoose.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
            },
        ],
    },
    {
        timestamps: { createdAt: "postDate", updatedAt: "updateDate" },
    }
);

const model = mongoose.model("Video", schema);

module.exports = model;
