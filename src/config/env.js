require("dotenv").config();

const env = {
    port: process.env.PORT || 3000,
    node_env: process.env.NODE_ENV,
    db: {
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        cluster_url: process.env.DB_CUSTER_URL,
        name: process.env.DB_NAME,
    },
    version: process.env.VERSION,
};

module.exports = env;
