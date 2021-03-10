const express = require("express");
const { checkSignature, getMessage, getTokens } = require("../controllers//wechat");
const router = express.Router();

router.get("/test", checkSignature);
router.post("/test", getMessage);
router.get("/getTokens", getTokens);

module.exports = router;
