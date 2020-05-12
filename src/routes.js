const express = require("express");
const userRoute = require("./routes/user");
const videoRoute = require("./routes/videos");
const authRoute = require("./routes/auth");

const router = express.Router();

router.use("/users", userRoute);
router.use("/videos", videoRoute);
router.use("/auth", authRoute);

module.exports = router;
