const { createHash } = require("crypto");
const { formateResponse } = require("../utils/helper");

const hashStr = (data) => {
    const hash = createHash("sha1");
    hash.update(data);
    const result = hash.digest("hex");
    return result;
};

const checkSignature = (req, res) => {
    const { signature, timestamp, nonce } = req.body;
    const token = "jrtesting";
    const tempArr = [token, timestamp, nonce];
    tempArr.sort();
    const combinedStr = tempArr.reduce((acc, curr) => {
        acc += curr;
        return acc;
    });

    const hashed = hashStr(combinedStr);

    if (hashed === signature) {
        return res.send(true);
    }
    return res.send(false);
};

module.exports = { checkSignature };
