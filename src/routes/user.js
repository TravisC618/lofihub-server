const express = require("express");
const {
    getUser,
    getAllUser,
    addUser,
    userConfirmation,
    resetUserPwd,
    findUserPwd,
    updateUser,
    updateUserAvatar,
    addLike,
    removeLike,
    addDislike,
    removeDislike,
} = require("../controllers/user");
const validateAuth = require("../middlewares/validateAuth");
const { uploadImage } = require("../utils/upload.js");
const authGuard = require("../middlewares/authGuard");

const router = express.Router();

router.get("/", getAllUser);
router.get("/:id", getUser);
router.get("/:id/confirmation/:token", userConfirmation);
router.put("/resetpass/:token", resetUserPwd);
router.post("/:id/findpass", findUserPwd);
router.post("/", validateAuth, addUser);
router.post("/:id", authGuard, updateUser);
router.put(
    "/:id/avatar",
    authGuard,
    uploadImage("id", "avatar"),
    updateUserAvatar
);
router.post("/:id/like/:videoId", addLike);
router.post("/:id/removelike/:videoId", removeLike);
router.post("/:id/dislike/:videoId", addDislike);
router.post("/:id/removedislike/:videoId", removeDislike);

module.exports = router;
