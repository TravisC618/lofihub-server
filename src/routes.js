const express = require("express");
const coWechat = require('co-wechat');
const userRoute = require("./routes/user");
const videoRoute = require("./routes/videos");
const authRoute = require("./routes/auth");
const wechatRoute = require("./routes/wechat");

const router = express.Router();
const wechatConf = {
    appid: 'wx7d05a51683c6aaad',
    appsecret: '027138ab9ce27183de1b3770d728926f', 
    token: 'jrtesting',
}

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
