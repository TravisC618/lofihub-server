const express = require("express");
const { checkSignature, evenHandler, getMessage } = require("../controllers//wechat");
const router = express.Router();

router.get("/test", checkSignature);
router.post("/test", getMessage)
router.post("/event", evenHandler);

module.exports = router;
