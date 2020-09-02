const express = require("express");
const userRoute = require("./routes/user");
const videoRoute = require("./routes/videos");
const authRoute = require("./routes/auth");
const wechatRoute = require("./routes/wechat");

const router = express.Router();

router.use("/users", userRoute);
router.use("/videos", videoRoute);
router.use("/auth", authRoute);
router.use("/wechat", wechatRoute);

module.exports = router;
