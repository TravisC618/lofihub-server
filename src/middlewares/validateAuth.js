const Joi = require("@hapi/joi");
const { formateResponse } = require("../utils/helper");

function validate(req) {
    const schema = Joi.object({
        email: Joi.string()
            .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
            .required(),
        password: Joi.string()
            .min(6)
            .max(20)
            .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
            .required(),
        username: Joi.string().min(3).max(15).required(),
    });

    return schema.validate(req);
}

module.exports = (req, res, next) => {
    const { error } = validate(req.body);
    if (error) {
        return formateResponse(res, error.details[0].message, 400);
    }
    return next();
};
