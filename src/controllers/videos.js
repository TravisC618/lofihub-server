const User = require("../models/user");
const Video = require("../models/video");
const { formateResponse } = require("../utils/helper");

const getVideo = async (req, res) => {
    const { id } = req.params;
    const existingVideo = await Video.findById(id).populate(
        "poster",
        "username avatar followers"
    );
    if (!existingVideo) {
        return formateResponse(res, "Video does not existed", 404);
    }
    return formateResponse(res, existingVideo, 200);
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
        url: req.file.location,
    });

    newVideo.poster = existingUser._id;
    existingUser.videos.addToSet(newVideo._id);

    await newVideo.save();
    await existingUser.save();

    return formateResponse(res, newVideo, 200);
};

module.exports = { addVideo, getVideo };
