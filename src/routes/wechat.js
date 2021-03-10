const express = require("express");
const { checkSignature, evenHandler, getMessage } = require("../controllers//wechat");
const router = express.Router();

router.get("/", checkSignature);
router.post("/", getMessage)
router.post("/event", evenHandler);

module.exports = router;
