const User = require("../models/user");
const Video = require("../models/video");
const { formateResponse, convertUpdateBody } = require("../utils/helper");
const { deleteImage } = require("../utils/upload");
const { generateToken } = require("../utils/jwt");
const { transporter } = require("../utils/nodemailer");
const { verifyToken } = require("../utils/jwt");

// register
const addUser = async (req, res) => {
    const { email, password, username } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return formateResponse(res, "Email is already existed", 404);
    }

    const newUser = new User({ email, password, username });
    await newUser.hashPassword();

    await newUser.save();

    // send async email
    const token = generateToken(newUser._id, "login");
    // TODO change to actual link
    const url = `http://localhost:3000/confirmation/${token}`;

    transporter.sendMail({
        to: email,
        subject: "Confirm Email",
        html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`,
    });

    return formateResponse(res, { userId: newUser._id }, 200);
};

const userConfirmation = async (req, res) => {
    const { id, token } = req.params;

    const decoded = verifyToken(token, "login");
    if (!decoded) {
        return formateResponse(res, "Invalid token", 400);
    }

    const existingUser = await User.findByIdAndUpdate(id, {
        confirmed: true,
    });

    if (!existingUser) {
        return formateResponse(res, "User does not existed", 404);
    }

    // TODO replace the actual link
    return formateResponse(res, { id, token }, 200);
};

const resetUserPwd = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const decoded = verifyToken(token, "email");
    if (!decoded) {
        return formateResponse(res, "Access denied. Invalid token.", 400);
    }

    const { payload: id } = decoded;

    // password validation
    if (!password) {
        return formateResponse(res, "Invalid password", 400);
    }

    // check whether the input password equals to current password
    // ...

    const existingUser = await User.findByIdAndUpdate(
        id,
        {
            password,
        },
        { new: true }
    );

    if (!existingUser) {
        return formateResponse(res, "User does not existed", 404);
    }

    await existingUser.hashPassword();
    await existingUser.save();

    return formateResponse(res, "Password has successfully reset.", 200);
};

const findUserPwd = async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
        return formateResponse(res, "User does not existed", 404);
    }

    // send async email
    const token = generateToken(existingUser._id, "email");
    // TODO change to actual link
    const url = `http://localhost:3000/reset-password/${token}`;

    transporter.sendMail({
        to: email,
        subject: "Reset Email",
        html: `Please click this email to reset your password: <a href="${url}">${url}</a>`,
    });

    return formateResponse(
        res,
        "Reset link has rent, please check your email.",
        200
    );
};

const getUser = async (req, res) => {
    const { id } = req.params;

    const existingUser = await User.findById(id).populate("videos").select({
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
    if (!req.file) {
        return formateResponse(res, "Image missing", 400);
    }

    const { id } = req.params;
    const existingUser = await User.findByIdAndUpdate(
        id,
        {
            avatar: req.file.location,
        },
        { new: true }
    );

    if (!existingUser) {
        deleteImage(req.file.key);
        return formateResponse(res, "User does not existed", 404);
    }

    return formateResponse(res, "Avatar uploaded successfully", 200);
};

const addLike = async (req, res) => {
    const { id, videoId } = req.params;

    // check existed
    const existingUser = await User.findById(id);
    const existingVideo = await Video.findById(videoId);

    if (!existingUser)
        return formateResponse(res, "User does not existed", 404);
    if (!existingVideo)
        return formateResponse(res, "Video does not existed", 404);

    // check if disliked
    if (
        existingUser.dislike.includes(videoId) ||
        existingVideo.dislike.includes(id)
    ) {
        await removeDislike(req, res);
    }

    const userLikeOldLength = existingUser.like.length;
    const videoLikeOldLength = existingVideo.like.length;

    // add like to both model
    existingUser.like.addToSet(videoId);
    existingVideo.like.addToSet(id);

    // validation
    if (
        userLikeOldLength === existingUser.like.length ||
        videoLikeOldLength === existingVideo.like.length
    ) {
        return formateResponse(res, "Like failed, please try again", 400);
    }

    // return success
    await existingUser.save();
    await existingVideo.save();

    return formateResponse(res, "Added to Liked Videos", 200);
};

const removeLike = async (req, res) => {
    const { id, videoId } = req.params;

    // check existed
    const existingUser = await User.findByIdAndUpdate(id, {
        $pull: { like: videoId },
    });
    const existingVideo = await Video.findByIdAndUpdate(videoId, {
        $pull: {
            like: id,
        },
    });

    if (!existingUser)
        return formateResponse(res, "User does not existed", 404);
    if (!existingVideo)
        return formateResponse(res, "Video does not existed", 404);

    return formateResponse(res, "Removed from Liked Video", 200);
};

const addDislike = async (req, res) => {
    const { id, videoId } = req.params;

    // check existed
    const existingUser = await User.findById(id);
    const existingVideo = await Video.findById(videoId);

    if (!existingUser)
        return formateResponse(res, "User does not existed", 404);
    if (!existingVideo)
        return formateResponse(res, "Video does not existed", 404);

    // check if liked
    if (
        existingUser.like.includes(videoId) ||
        existingVideo.like.includes(id)
    ) {
        await removeLike(req, res);
    }

    const userDislikeOldLength = existingUser.dislike.length;
    const videoDislikeOldLength = existingVideo.dislike.length;

    // add like to both model
    existingUser.dislike.addToSet(videoId);
    existingVideo.dislike.addToSet(id);

    // validation
    if (
        userDislikeOldLength === existingUser.dislike.length ||
        videoDislikeOldLength === existingVideo.dislike.length
    ) {
        return formateResponse(res, "Dislike failed, please try again", 400);
    }

    // return success
    await existingUser.save();
    await existingVideo.save();

    return formateResponse(res, "Added to Disliked Videos", 200);
};

const removeDislike = async (req, res) => {
    const { id, videoId } = req.params;

    // check existed
    const existingUser = await User.findByIdAndUpdate(id, {
        $pull: { dislike: videoId },
    });
    const existingVideo = await Video.findByIdAndUpdate(videoId, {
        $pull: {
            dislike: id,
        },
    });

    if (!existingUser)
        return formateResponse(res, "User does not existed", 404);
    if (!existingVideo)
        return formateResponse(res, "Video does not existed", 404);

    return formateResponse(res, "Removed from Disliked Video", 200);
};

module.exports = {
    getUser,
    getAllUser,
    addUser,
    userConfirmation,
    resetUserPwd,
    findUserPwd,
    updateUser,
    updateUserAvatar,
    addLike,
    removeLike,
    addDislike,
    removeDislike,
};
