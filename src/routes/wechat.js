const express = require("express");
const { checkSignature, evenHandler } = require("../controllers//wechat");
const router = express.Router();

router.get("/", checkSignature);
router.post("/event", evenHandler);

module.exports = router;
