const jwt = require("jsonwebtoken");

const generateToken = (payload, type) => {
    let token;
    switch (type) {
        case "login":
            token = jwt.sign({ payload }, process.env.JWT_KEY, {
                expiresIn: "1d",
            });
            break;
        case "email":
            token = jwt.sign({ payload }, process.env.JWT_EMAIL_SECRETE, {
                expiresIn: "1d",
            });
            break;
        default:
            break;
    }
    return token;
};

const verifyToken = (token, type) => {
    let decoded;
    try {
        switch (type) {
            case "login":
                decoded = jwt.verify(token, process.env.JWT_KEY);
                break;
            case "email":
                decoded = jwt.verify(token, process.env.JWT_EMAIL_SECRETE);
                break;
            default:
                break;
        }
    } catch (e) {
        return null;
    }
    return decoded;
};

module.exports = { generateToken, verifyToken };
