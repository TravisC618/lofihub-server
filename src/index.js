require("dotenv").config();
const express = require("express");
require("express-async-errors");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const routers = require("./routes");
const { connectToDB } = require("./utils/db");
const errHandler = require("./middlewares/errHandler");

const app = express();

const HOST = "0.0.0.0";
const PORT = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());

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
