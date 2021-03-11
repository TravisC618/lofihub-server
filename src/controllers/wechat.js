const fs = require("fs");
const util = require("util");
const { createHash } = require("crypto");
const xml2js = require("xml2js");
const { formateResponse } = require("../utils/helper");
const axios = require('axios');
const wechatConf = require("../config/wechatConf");
const { cache } = require("../utils/cacheHelper");
const OAuth = require('co-wechat-oauth');
const oauth = new OAuth(wechatConf.appid, wechatConf.appsecret);

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

const getToken = async () => {
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${wechatConf.appid}&secret=${wechatConf.appsecret}`;
    const cacheName = 'access_token';
    // if no cache => update token
    if (!cache.has(cacheName)) {
        const tokenRes = await axios.get(url);
        const access_token = tokenRes.data.access_token;

        // save access token
        await cache.set(cacheName, { access_token }, 3600);
        console.log('no cache: ', access_token);
        return access_token;
    }

    console.log("has cache: ", cache.get(cacheName)[cacheName]);
    return cache.get(cacheName)[cacheName];
}

const getFollowers = async (req, res) => {
    const accessToken = await getToken();
    const followersUrl = `https://api.weixin.qq.com/cgi-bin/user/get?access_token=${accessToken}`;
    const getRes = await axios.get(followersUrl);
    console.log('receive data: ', getRes.data);
    
    // getUserInfo
    const firstUserOpenId = getRes.data.data.openid[0];
    const getUserInfoUrl = `https://api.weixin.qq.com/cgi-bin/user/info?access_token=${accessToken}&openid=${firstUserOpenId}&lang=zh_CN`
    const userInfoRes = await axios.get(getUserInfoUrl);
    console.log('user info: ', userInfoRes.data);
    return res.send(JSON.stringify(userInfoRes.data));
}

const wechatAuthorize = async (req, res) => {
    const state = req.query.id;

    // get the href url 
    // console.log("protocol: ", req.protocol);
    // console.log("hostname: ", req.hostname);
    // const redirect = `${req.protocol}//${req.hostname}/api/wechat/authCallback`;
    const domain = 'https://lofihub-server.herokuapp.com';
    const redirect = `${domain}/api/wechat/wechatAuthCallback`;
    
    // info scope that user agree to share
    // fetch user basic info
    // if only needs user's openid, then scope set as 'snsapi_base'
    const SCOPE = 'snsapi_userinfo'; //TODO save in confid

    const authUrl = oauth.getAuthorizeURL(redirect, state, SCOPE);
    console.log("authUrl: ", authUrl);
    return res.send({ authUrl });
}

const wechatAuthCallback = async (req, res) => {
    // auth code fetching from wechat server
    const { code, state} = req.query;

    const isProd = process.env.NODE_ENV === 'production';
    const domain = isProd ? 'http://lofihub-client.s3-website-ap-southeast-2.amazonaws.com' : 'http://localhost:3000';
    const redirect = '/login';

    try {
        // use code to get access of wechat user's info
        const token = await oauth.getAccessToken(code); 
    
        const { access_token: accessToken, openid } = token.data;
    
        // fetch current user info by openid
        const userInfo = await getUserInfo(openid);
        return res.send({ userInfo });
    } catch (error) {
        return res.error({ error });
    }

    // auth locally ...
    return res.status(201).redirect(`${domain}${redirect}?valid=${code}`); // TODO to delete 不能把openid传到前端
}

const getUserInfo = async (openid) => {
    const userInfo = await oauth.getUser(openid);
    return userInfo;
}

const eventHandler = async (req, res) => {
    const { xml: msg } = req.body;
    console.log('Receive:', msg)
    let baseData = {
        ToUserName: msg.FromUserName, 
        FromUserName: msg.ToUserName, 
        CreateTime: Date.now()
    }

    if (msg.MsgType === 'event') {
        if (msg.Event === 'subscribe') {
            baseData = Object.assign(baseData, {
                MsgType: msg.MsgType, // 可不要？
                Content: '您好，您的微信号尚未绑定匠人lms账号哦~请按照页面提示注册新账号或绑定已有账号。'
            })
        }
    }

    const builder = new xml2js.Builder();
    const result = builder.buildObject({
        xml: baseData
    });

    console.log('access_token: ', getToken());

    return res.send(result);
}

module.exports = { checkSignature, getMessage, getFollowers, wechatAuthorize, wechatAuthCallback, eventHandler };
