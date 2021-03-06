const User = require("../models/user");
const { formateResponse } = require("../utils/helper");
const { generateToken } = require("../utils/jwt");

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    let existingUser = await User.findOne({ email });

    if (!existingUser) {
        return formateResponse(res, "Invalid email or password", 404);
    }

    // check whether user confirmed the email
    if (!existingUser.confirmed) {
        return formateResponse(res, "Please confirm your email to login", 400);
    }

    if (!(await existingUser.validatePassword(password))) {
        return formateResponse(res, "Invalid email or password", 404);
    }

    const token = generateToken(existingUser._id, "login");

    return formateResponse(
        res,
        {
            userId: existingUser._id,
            token,
        },
        200
    );
};

module.exports = { loginUser };
