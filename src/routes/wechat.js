const express = require("express");
const { checkSignature } = require("../controllers//wechat");
const router = express.Router();

router.get("/", checkSignature);

module.exports = router;
