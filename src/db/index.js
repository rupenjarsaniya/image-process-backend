const mongoose = require("mongoose");
const env = require("../config/env");

const options = {};

const connectDB = async () => {
    let uri = "";

    if (!env.db.username || !env.db.password || !env.db.cluster_url) {
        uri = `mongodb://localhost:27017/${env.db.name}`;
    } else {
        uri = `mongodb+srv://${env.db.username}:${env.db.password}@${env.db.cluster_url}/${env.db.name}?retryWrites=true&w=majority`;
    }

    if (env.node_env === "development") {
        mongoose.set("debug", true);
    }

    try {
        await mongoose.connect(uri, options);
        console.log("🚀 Databse connected successfully");
    } catch (err) {
        console.error("Database connection error:", err);
        process.exit(1);
    }
};

module.exports = connectDB;
