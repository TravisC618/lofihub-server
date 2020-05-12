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
            // required: true,
        },
        category: {
            type: Array,
            // required: true,
        },
        ageRestriction: {
            type: Boolean,
            // required: true,
        },
        thumbnail: {
            type: String,
        },
        views: {
            type: Number,
            default: 0,
        },
        like: {
            type: Number,
            default: 0,
        },
        dislike: {
            type: Number,
            default: 0,
        },
        comments: {
            type: Array,
        },
        poster: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: { createdAt: "postDate", updatedAt: "updateDate" },
    }
);

const model = mongoose.model("Video", schema);

module.exports = model;
