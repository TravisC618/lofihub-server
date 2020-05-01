const fs = require("fs");
const multer = require("multer");
const aws = require("aws-sdk");
const multerS3 = require("multer-s3");
const { extractS3FolderName } = require("../utils/helper");

const BUCKET = "lofihub-file";

aws.config.update({
    secretAccessKey: process.env.S3_KEY,
    accessKeyId: process.env.S3_ID,
    region: "ap-southeast-2",
});

const s3 = new aws.S3();

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
        storage: multerS3({
            s3: s3,
            bucket: BUCKET,
            acl: "public-read",
            key: (req, file, cb) => {
                cb(
                    null,
                    `${extractS3FolderName(req.baseUrl)}/${
                        req.params[key]
                    }.jpeg`
                );
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
