const fs = require("fs");
const multer = require("multer");
const aws = require("aws-sdk");
const multerS3 = require("multer-s3");
const { extractS3FolderName, removeFileFormate } = require("../utils/helper");

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

const uploadVideo = (key, filename) => {
    return multer({
        storage: multerS3({
            s3: s3,
            bucket: BUCKET,
            acl: "public-read",
            key: (req, file, cb) => {
                const fileName = removeFileFormate(file.originalname);
                cb(
                    null,
                    `${extractS3FolderName(req.baseUrl)}/${
                        req.params[key]
                    }/${fileName}-${Date.now()}.mp4`
                );
            },
            limits: { fileSize: 1024 * 1024 * 200 },
        }),
    }).single(filename);
};

const deleteImage = (key) =>
    new Promise((res, rej) => {
        s3.deleteObject({ Bucket: BUCKET, Key: key }, (err, data) => {
            if (err) rej(err);
            res(data);
        });
    });

module.exports = { uploadImage, deleteImage, uploadVideo };
