const fs = require("fs");
const util = require("util");
const { createHash } = require("crypto");
const xml2js = require("xml2js");
const { formateResponse } = require("../utils/helper");

// expires in 7200s
const ACCESS_TOKEN =
    "36_Lh7JKEn4ITYYML-Yb8MKiE6DE0GeAa3wK4PERMjJK_UVFazWLNcf5s1x_sSTVRMbJ2xC_qxbi94PAz451NYqcC5dN3yJKkcxpiPH7YGp2mNkNxfsbLDkkenMrl5tQ7bymfdOjsk94BOX5dIUHUOgAJALYS";

const checkSignature = async (req, res) => {
    const token = "jrtesting";
    const query = urlFormat.parse(req.url, true).query;
    const { signature, timestamp, nonce, echostr } = query;

    console.log("isValid", isValid(timestamp, nonce, signature, token));
    if (isValid(timestamp, nonce, signature, token)) {
        return res.send(echostr);
    }
    return res.send(false);
};

const isValid = (timestamp, nonce, signature, token) => {
    const tmp = [token, timestamp, nonce].sort().join('');
    const currSign = createHash('sha1').update(tmp).digest('hex');
    return currSign === signature;
}

const getMessage = async (req, res) => {
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
