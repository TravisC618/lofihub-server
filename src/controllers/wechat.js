const fs = require("fs");
const util = require("util");
const { createHash } = require("crypto");
const xml2js = require("xml2js");
const { formateResponse } = require("../utils/helper");
const axios = require('axios');
const wechatConf = require("../config/wechatConf");

// expires in 7200s
const ACCESS_TOKEN =
    "36_Lh7JKEn4ITYYML-Yb8MKiE6DE0GeAa3wK4PERMjJK_UVFazWLNcf5s1x_sSTVRMbJ2xC_qxbi94PAz451NYqcC5dN3yJKkcxpiPH7YGp2mNkNxfsbLDkkenMrl5tQ7bymfdOjsk94BOX5dIUHUOgAJALYS";

const checkSignature = async (req, res) => {
    const token = "jrtesting";
    const { signature, timestamp, nonce, echostr } = req.query;

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

// ============get access token============
const tokenCache = { 
    access_token: '', 
    updateTime: Date.now(), 
    expires_in: 7200
};

const getTokens = async (req, res) => {
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${wechatConf.appid}&secret=${wechatConf.appsecret}`;
    const tokenRes = await axios.get(url);
    Object.assign(tokenCache, tokenRes.data, {
        updateTime: Date.now()
    });
    console.log("tokenCache: ", tokenCache);
    return res.send(tokenRes);
}

module.exports = { checkSignature, getTokens, getMessage };
