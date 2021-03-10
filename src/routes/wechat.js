const express = require("express");
const { checkSignature, getMessage, getFollowers, wechatAuthorize } = require("../controllers//wechat");
const router = express.Router();

router.get("/test", checkSignature);
router.post("/test", getMessage);
// router.get("/getToken", getToken);
router.get("/getFollowers", getFollowers);
router.get("/wechatAuthorize", wechatAuthorize);

module.exports = router;
