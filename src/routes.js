const express = require("express");
const coWechat = require('co-wechat');
const userRoute = require("./routes/user");
const videoRoute = require("./routes/videos");
const authRoute = require("./routes/auth");
const wechatRoute = require("./routes/wechat");
const wechatConf = require("./config/wechatConf");

const router = express.Router();

router.all('/wechat', coWechat(wechatConf).middleware(
    async message => {
        console.log('wechart', message)
        return 'Hello world! ' + message.Content;
}));
router.use("/users", userRoute);
router.use("/videos", videoRoute);
router.use("/auth", authRoute);
router.use("/wechat", wechatRoute);

module.exports = router;
