const { Schema, model } = require("mongoose");
const collection = require("../utils/collection");

const schema = new Schema(
    {
        requestId: { type: String, required: true },
        serialNumber: { type: Number, required: true },
        productName: { type: String, required: true },
        inputImageUrls: { type: [String], required: true },
        outputImageUrls: { type: [String], required: true },
        status: { type: String, enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"], default: "PENDING" },
    },
    {
        timestamps: true,
    },
);

module.exports = model(collection.PRODUCT, schema);
