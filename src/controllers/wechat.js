const { createHash } = require("crypto");
const { formateResponse } = require("../utils/helper");

// expires in 7200s
const ACCESS_TOKEN =
    "36_Lh7JKEn4ITYYML-Yb8MKiE6DE0GeAa3wK4PERMjJK_UVFazWLNcf5s1x_sSTVRMbJ2xC_qxbi94PAz451NYqcC5dN3yJKkcxpiPH7YGp2mNkNxfsbLDkkenMrl5tQ7bymfdOjsk94BOX5dIUHUOgAJALYS";

const hashStr = (data) => {
    const hash = createHash("sha1");
    hash.update(data);
    const result = hash.digest("hex");
    return result;
};

const checkSignature = (req, res) => {
    const { signature, timestamp, nonce, echostr } = req.body;
    const token = "jrtesting";
    const tempArr = [token, timestamp, nonce];
    tempArr.sort();
    const combinedStr = tempArr.reduce((acc, curr) => {
        acc += curr;
        return acc;
    });

    const hashed = hashStr(combinedStr);

    if (hashed === signature) {
        return res.send(echostr);
    }
    return null;
};

const evenHandler = (req, res) => {
    const { ToUserName, FromUserName, CreateTime, MsgType, Event } = req.body;
    return res.send({ ToUserName, FromUserName, CreateTime, MsgType, Event });
};

module.exports = { checkSignature, evenHandler };
