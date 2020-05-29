const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const schema = mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
        confirmed: {
            type: Boolean,
            default: false,
        },

        avatar: {
            type: String,
        },
        introduction: {
            type: String,
            default: "Too lazy to leave an introduction...",
        },
        gender: {
            type: String,
            default: "male",
        },
        birthday: {
            type: Date,
            default: new Date(),
        },
        videos: [
            {
                type: mongoose.Types.ObjectId,
                ref: "Video",
            },
        ],
        comments: [
            {
                video: {
                    type: mongoose.Types.ObjectId,
                    ref: "Video",
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
        like: [
            {
                type: mongoose.Types.ObjectId,
                ref: "Video",
            },
        ],
        dislike: [
            {
                type: mongoose.Types.ObjectId,
                ref: "Video",
            },
        ],
        favorites: [
            {
                type: mongoose.Types.ObjectId,
                ref: "Video",
            },
        ],
        followers: [
            {
                type: mongoose.Types.ObjectId,
                ref: "User",
            },
        ],
        following: [
            {
                type: mongoose.Types.ObjectId,
                ref: "User",
            },
        ],
        bullets: [
            {
                type: mongoose.Types.ObjectId,
                ref: "Video",
            },
        ],
    },
    { timestamps: true }
);

schema.methods.hashPassword = async function () {
    this.password = await bcrypt.hash(this.password, 10);
};

schema.methods.validatePassword = async function (password) {
    const isValid = await bcrypt.compare(password, this.password);

    return isValid;
};

const model = mongoose.model("User", schema);

module.exports = model;
