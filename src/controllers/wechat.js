const fs = require("fs");
const util = require("util");
const { createHash } = require("crypto");
const xml2js = require("xml2js");
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

const getMessage = (req, res) => {
    const { xml: msg } = req.body;
    console.log('Receive:', msg)
    const builder = new xml2js.Builder();
    const result = builder.buildObject({
        xml: {
            ToUserName: msg.FromUserName, 
            FromUserName: msg.ToUserName, 
            CreateTime: Date.now(),
            MsgType: msg.MsgType,
            Content: 'Hello ' + msg.Content
        }
    });

    return res.send(result);
}

const evenHandler = async (req, res) => {
    const parser = new xml2js.Parser();
    const builder = new xml2js.Builder();
    let data = "";

    // parse buffer to string once get the data
    req.on("data", function (data_) {
        data += data_.toString();
    });

    req.on("end", function () {
        // console.log("data", bodyData);
        // const email = getXMLNodeValur("email", bodyData);
        // console.log("email", email);
        parser.parseString(data, function (err, result) {
            debugger;
            console.log("FINISHED", err, result);
            const {
                emails: { email },
            } = result;
            const { to, from, heading, body } = email[0];
            // const output = util.inspect(result, false, null, true);
            // console.log("FINAL OUTPUT", output);
            const output = {
                to: to[0],
                from: from[0],
                heading: heading[0],
                body: body[0],
            };
            return formateResponse(res, output, 200);
        });
    });
    return res.send(data);
};

// helper
const getXMLNodeValur = (name, xml) => {
    const str = xml.split("<" + name + ">");
    return str;
    // const tempStr =
};

module.exports = { checkSignature, evenHandler, getMessage };
