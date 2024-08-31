const { Schema, model } = require("mongoose");
const collection = require("../utils/collection");

const schema = new Schema(
    {
        requestId: { type: String, required: true, unique: true },
        status: { type: String, enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"], default: "PENDING" },
    },
    {
        timestamps: true,
    },
);

module.exports = model(collection.REQUEST, schema);
