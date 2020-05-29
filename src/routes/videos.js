const express = require("express");
const {
    addVideo,
    getVideo,
    getAllVideos,
    updateVideo,
    updateThumbnail,
    addComment,
    addBullet,
} = require("../controllers/videos");
const validateVideoInfo = require("../middlewares/validateVideoInfo");
const { uploadVideo, uploadImage } = require("../utils/upload");

const router = express.Router();

router.get("/", getAllVideos);
router.get("/:id", getVideo);
router.put("/edit/:id", validateVideoInfo, updateVideo);
router.put("/:userId", uploadVideo("userId", "video"), addVideo);
router.put("/:id/thumbnail", uploadImage("id", "thumbnail"), updateThumbnail);
router.post("/:id/comments/:userId", addComment);
router.post("/:id/bullets/:userId", addBullet);

module.exports = router;
