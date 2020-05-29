const Joi = require("@hapi/joi");
const { formateResponse } = require("../utils/helper");

function validate(req) {
    const schema = Joi.object({
        title: Joi.string().min(3).max(100).required(),
        description: Joi.string().min(0).max(1000),
        category: Joi.array(),
        ageRestriction: Joi.boolean(),
        bullets: Joi.array(),
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
