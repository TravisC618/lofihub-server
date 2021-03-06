require("dotenv").config();
const express = require("express");
require("express-async-errors");
const webpush = require("web-push");
const bodyParser = require("body-parser");
require("body-parser-xml")(bodyParser);
const path = require("path");
const cors = require("cors");
const routers = require("./routes");
const { connectToDB } = require("./utils/db");
const errHandler = require("./middlewares/errHandler");

const corsOption = {
    "origin": "http://lofihub-client.s3-website-ap-southeast-2.amazonaws.com",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
};

const app = express();

const HOST = "0.0.0.0";
const PORT = process.env.PORT || 4000;
app.use(cors(corsOption));
app.use(express.json());
app.use(bodyParser.xml());

// app.use("/uploads", express.static("uploads")); //TODO to delete

app.use("/api", routers);
app.use(errHandler);

webpush.setVapidDetails(
    "mailto:test@test,com",
    process.env.PUBLIC_VAPID_KEY,
    process.env.PRIVATE_VAPID_KEY
);

connectToDB()
    .then(() => {
        console.log("DB connected");
        app.listen(PORT, HOST, () => {
            console.log(`Server is listening to PORT: ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("DB connection failed");
        console.error(err.message);
        process.exit(1);
    });
