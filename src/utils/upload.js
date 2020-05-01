const fs = require("fs");
const multer = require("multer");
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        cb(null, true);
    } else {
        cb({
            name: "MulterError",
            message: "Only accept jpeg and png file",
        });
    }
};

//TODO when deploy to amazon s3, this function need to be modified
const uploadImage = (key, filename) => {
    return multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, `./uploads`);
            },
            filename: function (req, file, cb) {
                const name = req.params[key] + "-" + filename;
                cb(null, name);
            },
        }),
        limits: { fileSize: 1024 * 1024 * 5 },
        fileFilter,
    }).single(filename);
};

//TODO when deploy to amazon s3, this function need to be modified
const deleteImage = (path) => {
    fs.unlink(path, (err) => {
        if (err) {
            res.send(err);
        }
    });
};

module.exports = { uploadImage, deleteImage };
