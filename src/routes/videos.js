const express = require("express");
const { addVideo, getVideo } = require("../controllers/videos");
const { uploadVideo } = require("../utils/upload");

const router = express.Router();

router.get("/:id", getVideo);
router.put("/:userId", uploadVideo("userId", "video"), addVideo);

module.exports = router;
