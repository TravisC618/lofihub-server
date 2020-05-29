const User = require("../models/user");
const Video = require("../models/video");
const {
    formateResponse,
    convertQuery,
    getAll,
    removeFileFormate,
    convertUpdateBody,
    countAllWithSearch,
} = require("../utils/helper");
const { deleteImage } = require("../utils/upload");

const getVideo = async (req, res) => {
    const { id } = req.params;

    const existingVideo = await Video.findById(id)
        .populate("poster", "username avatar followers")
        .populate("comments.poster", "username avatar");

    if (!existingVideo) {
        return formateResponse(res, "Video does not existed", 404);
    }
    return formateResponse(res, existingVideo, 200);
};

const getAllVideos = async (req, res) => {
    // q: search key
    const { q } = req.query;
    const total = await countAllWithSearch(Video, q);

    const { pagination, search, sort, date, category, duration } = convertQuery(
        req.query,
        total
    );

    const videos = await getAll(
        Video,
        pagination,
        search,
        sort,
        date,
        category,
        duration
    );
    return formateResponse(res, { videos, pagination }, 200);
};

const addVideo = async (req, res) => {
    if (!req.file) {
        return formateResponse(res, "Video missing", 400);
    }
    const { userId } = req.params;
    const existingUser = await User.findById(userId);
    if (!existingUser) {
        return formateResponse(res, "User does not existed", 404);
    }

    const newVideo = new Video({
        title: removeFileFormate(req.file.originalname),
        url: req.file.location,
    });

    newVideo.poster = existingUser._id;
    existingUser.videos.addToSet(newVideo._id);

    await newVideo.save();
    await existingUser.save();

    return formateResponse(res, newVideo, 200);
};

const updateVideo = async (req, res) => {
    const { id } = req.params;
    const keys = ["title", "description", "category", "ageRestriction"];

    const existingVideo = await Video.findByIdAndUpdate(
        id,
        convertUpdateBody(req.body, keys),
        { new: true }
    );

    if (!existingVideo) {
        return formateResponse(res, "Video does not existed", 404);
    }

    return formateResponse(res, existingVideo, 200);
};

const updateThumbnail = async (req, res) => {
    if (!req.file) {
        return formateResponse(res, "Image is missing", 400);
    }

    const { id } = req.params;
    const existingVideo = await Video.findByIdAndUpdate(
        id,
        {
            thumbnail: req.file.location,
        },
        { new: true }
    );

    if (!existingVideo) {
        deleteImage(req.file.key);
        return formateResponse(res, "Video is not existed", 404);
    }

    return formateResponse(res, existingVideo, 200);
};

const addComment = async (req, res) => {
    const { id, userId } = req.params;
    const { comment } = req.body;

    if (!comment) return formateResponse(res, "Comment cannot be empty", 400);

    const newComment = { poster: userId, comment };
    const commentHistory = { video: id, comment };

    const existingVideo = await Video.findById(id);

    const existingUser = await User.findById(userId);

    if (!existingVideo) {
        return formateResponse(res, "Video does not existed", 404);
    }
    if (!existingUser) {
        return formateResponse(res, "User does not existed", 404);
    }

    const videoOldLength = existingVideo.comments.length;
    const userOldLength = existingUser.comments.length;

    // push new comment in array
    existingVideo.comments.push(newComment);
    existingUser.comments.push(commentHistory);

    // check whether the comments array updated
    if (
        videoOldLength === existingVideo.comments.length ||
        userOldLength === existingUser.comments.length
    ) {
        return formateResponse(
            res,
            "Failed to leave the comment, please try again.",
            400
        );
    }

    // return success
    existingVideo.save();
    existingUser.save();

    return formateResponse(res, newComment, 200);
};

const addBullet = async (req, res) => {
    const { id, userId } = req.params;
    const { content, time } = req.body;
    const newBullet = { content, time, user: userId };

    const existingVideo = await Video.findById(id);
    const existingUser = await User.findById(userId);

    if (!existingVideo)
        return formateResponse(res, "Video does not existed", 404);
    if (!existingUser)
        return formateResponse(res, "User does not existed", 404);

    const oldCount = existingVideo.bullets.length;
    existingVideo.bullets.addToSet(newBullet);
    existingUser.bullets.addToSet(id);

    if (oldCount === existingVideo.bullets.length) {
        return formateResponse(
            res,
            "Fail to sent bullet, please try again.",
            400
        );
    }

    existingVideo.save();
    existingUser.save();

    return formateResponse(res, existingVideo, 200);
};

module.exports = {
    addVideo,
    getVideo,
    getAllVideos,
    updateVideo,
    updateThumbnail,
    addComment,
    addBullet,
};
