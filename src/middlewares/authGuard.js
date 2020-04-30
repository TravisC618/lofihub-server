const { verifyToken } = require("../utils/jwt");
const { formateResponse } = require("../utils/helper");

module.exports = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
        return formateResponse(
            res,
            "Access denied. No authorization header provied.",
            401
        );
    }

    const contentArr = authHeader.split(" ");
    if (contentArr.length !== 2 || contentArr[0] !== "Bearer") {
        return formateResponse(
            res,
            "Access denied. Invalid authorization formate.",
            401
        );
    }

    const decoded = verifyToken(contentArr[1]);
    if (decoded) {
        res.user = decoded;
        return next();
    }
    return formateResponse(res, "Access denied. Invalid token.", 401);
};
