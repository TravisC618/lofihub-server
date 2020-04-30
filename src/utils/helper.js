const formateResponse = (res, payload, code) => {
    const response = { statusCode: code };
    if (code < 400) {
        response.data = payload;
    } else {
        response.error = payload;
    }

    return res.status(code).send(response);
};

const convertUpdateBody = (body, keys) => {
    const newBody = {};

    keys.forEach((k) => {
        if (body[k]) {
            newBody[k] = body[k];
        }
    });

    return newBody;
};

module.exports = { formateResponse, convertUpdateBody };
