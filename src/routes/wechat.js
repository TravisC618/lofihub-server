const express = require("express");
const { checkSignature, getMessage, getFollowers, wechatAuthorize, wechatAuthCallback, eventHandler } = require("../controllers//wechat");
const router = express.Router();

router.get("/test", checkSignature);
router.post("/test", getMessage);
router.get("/getFollowers", getFollowers);
router.get("/wechatAuthorize", wechatAuthorize);
router.get("/wechatAuthCallback", wechatAuthCallback);
router.post("/eventHandler", eventHandler);


module.exports = router;
