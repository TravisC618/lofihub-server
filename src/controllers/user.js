const User = require("../models/user");
const { formateResponse, convertUpdateBody } = require("../utils/helper");
const { deleteImage } = require("../utils/upload");
const { generateToken } = require("../utils/jwt");

const addUser = async (req, res) => {
    const { email, password, username } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return formateResponse(res, "Email is already existed", 404);
    }

    const newUser = new User({ email, password, username });
    await newUser.hashPassword();

    await newUser.save();

    const token = generateToken(newUser._id);

    return formateResponse(res, { userId: newUser._id, token }, 200);
};

const getUser = async (req, res) => {
    const { id } = req.params;

    const existingUser = await User.findById(id).select({
        password: 0,
    });

    if (!existingUser) {
        return formateResponse(res, "User does not existed", 404);
    }

    return formateResponse(res, existingUser, 200);
};

const getAllUser = async (req, res) => {
    const allUsers = await User.find();

    return formateResponse(res, allUsers, 200);
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const keys = ["username", "introduction", "gender", "birthday"];

    const existingUser = await User.findByIdAndUpdate(
        id,
        convertUpdateBody(req.body, keys),
        { new: true }
    ).select({ password: 0 });
    if (!existingUser) {
        return formateResponse(res, "User does not existed", 404);
    }

    return formateResponse(res, existingUser, 200);
};

const updateUserAvatar = async (req, res) => {
    console.log(req.file);
    if (!req.file) {
        return formateResponse(res, "Image missing", 400);
    }

    const { id } = req.params;
    const existingUser = await User.findByIdAndUpdate(
        id,
        {
            avatar: req.file.path,
        },
        { new: true }
    );

    if (!existingUser) {
        deleteImage(req.file.path);
        return formateResponse(res, "User does not existed", 404);
    }

    return formateResponse(res, existingUser, 200);
};

module.exports = { getUser, getAllUser, addUser, updateUser, updateUserAvatar };
