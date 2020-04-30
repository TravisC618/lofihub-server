const express = require("express");
const {
    getUser,
    getAllUser,
    addUser,
    updateUser,
    updateUserAvatar,
} = require("../controllers/user");
const validateAuth = require("../middlewares/validateAuth");
const { uploadImage } = require("../utils/upload.js");
const authGuard = require("../middlewares/authGuard");

const router = express.Router();

router.get("/", getAllUser);
router.get("/:id", getUser);
router.post("/", validateAuth, addUser);
router.post("/:id", authGuard, updateUser);
router.put(
    "/:id/avatar",
    authGuard,
    uploadImage("id", "avatar"),
    updateUserAvatar
);

module.exports = router;
