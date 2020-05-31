const formateResponse = (res, payload, code) => {
    const response = { statusCode: code };
    if (code < 400) {
        response.data = payload;
    } else {
        response.error = payload;
    }

    return res.status(code).send(response);
};

const searchQueryCount = async function (model, search) {
    const count = await model
        .find({ title: { $regex: search, $options: "i" } })
        .countDocuments();
    return count;
};

const countAllWithSearch = async function (model, search) {
    let count;
    if (search) {
        count = searchQueryCount(model, search);
    } else {
        count = await model.find().countDocuments();
    }
    return count;
};

const convertQuery = (query, total) => {
    const pagination = convertPagination(query, total); // {page, pageSize, pages}
    const sort = convertSortQuery(query.sort);
    // const date = convertDate(query.date);
    // const priceRange = convertPriceRange(query);
    const search = query.q; // q=[keyword]
    return { pagination, search, sort };
};

// const convertDate = (query) => {

// }

const convertSortQuery = (query) => {
    const sort = {};
    if (query) {
        const keys = query.split(",");
        keys.forEach((key) => {
            if (key.includes("-")) {
                sort[key.replace("-", "")] = -1;
            } else {
                sort[key] = 1;
            }
        });
    }
    return sort;
};

const convertPagination = (query, count) => {
    // no document match
    if (count === 0) {
        return { page: 1, pageSize: 10, pages: 1 };
    }

    // get query
    let { page, pageSize } = query;
    page = parseInt(query.page) || 1;
    pageSize = parseInt(query.pageSize) || 10;

    if (page < 1) {
        page = 1;
    }
    // total pages after pagination
    const pages = Math.ceil(count / pageSize);

    if (page > pages) {
        page = pages;
    }

    return { page, pageSize, pages };
};

const searchQuery = async function (model, pagination, sort, search) {
    const { page, pageSize } = pagination;
    return model
        .find({ title: { $regex: search, $options: "i" } })
        .populate("poster", "username avatar")
        .sort(sort)
        .skip((page - 1) * pageSize)
        .limit(pageSize);
};

const getAll = function (
    model,
    pagination,
    search,
    sort,
    date,
    category,
    duration
) {
    const { page, pageSize } = pagination;
    let query;

    if (search) {
        query = searchQuery(model, pagination, sort, search);
    } else {
        query = model.find().populate("poster", "username avatar");
        query = query.sort(sort);
        query = query.skip((page - 1) * pageSize).limit(pageSize);
    }
    return query;
};

const removeFileFormate = (orginalName) => {
    return orginalName.replace(/\.[^/.]+$/, "");
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

const compare = (attr, order) => {
    return (obj1, obj2) => {
        const val1 = obj1[attr];
        const val2 = obj2[attr];

        let result;
        order === "asc" ? (result = val1 - val2) : (result = val2 - val1);
        return result;
    };
};

const extractS3FolderName = (baseUrl) => {
    const urlArray = baseUrl.split("/");
    return urlArray[urlArray.length - 1];
};

module.exports = {
    formateResponse,
    countAllWithSearch,
    convertQuery,
    getAll,
    removeFileFormate,
    convertUpdateBody,
    extractS3FolderName,
    compare,
};
