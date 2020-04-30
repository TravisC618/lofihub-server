const { formateResponse } = require("../utils/helper");

module.exports = (err, req, res, next) => {
    if (err.name === "ValidationError") {
        return formateResponse(res, err.message, 400);
    }
    if (err.name === "MulterError") {
        return formateResponse(res, err.message, 400);
    }
    console.log(err);
    return res.status(500).json("Something unexpected happened");
};
