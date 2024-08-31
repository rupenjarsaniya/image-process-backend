const cors = require("cors");
const express = require("express");
const config = require("./config/env");
const connectDB = require("./db");
const env = require("./config/env");
const { errorLogger, errorResponder } = require("./middlewares/errorHandler.middleware");
const invalidPathHandler = require("./middlewares/pathHandler.middleware");
const requestLogger = require("./middlewares/reqLogger.middleware");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.options("*", cors());
app.use(requestLogger);

app.get("/", (_req, res) => res.send("Backend is running, use /version or /ping"));
app.get("/version", (_req, res) => res.send(config.version));
app.get("/ping", (_req, res) => res.send("pong 🏓"));

app.use(errorLogger);
app.use(errorResponder);
app.use(invalidPathHandler);

const start = async () => {
    try {
        await connectDB();

        app.listen(config.port, () => {
            if (env.node_env === "development") {
                console.log(`Server is listening on: http://localhost:${config.port}`);
            } else {
                console.log(`Server is listening on: ${config.port}`);
            }
        });
    } catch (error) {
        console.error("Error connecting to database", error);
    }
};

start();
