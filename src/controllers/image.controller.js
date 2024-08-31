const fs = require("fs");
const uuid = require("uuid");
const csv = require("csv-parser");
const { OK, BAD_REQUEST } = require("http-status");
const { ProductModel, RequestModel } = require("../models");
const { ImageService } = require("../services");
const responseSender = require("../utils/responseSender");
const asyncHandler = require("../middlewares/asyncHandler.middleware");

const uploadCSV = asyncHandler(async (req, res) => {
    if (!req.file) {
        const resObj = {
            status: BAD_REQUEST,
            success: false,
            message: "Please upload a file",
            data: null,
        };

        return responseSender(resObj, res);
    }

    const requestId = uuid.v4();
    const request = new RequestModel({ requestId });
    await request.save();

    const results = [];
    const errors = [];

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (data) => {
            const rowNumber = results.length + 1; // Row number is 1-based index
            const serialNumber = data["Serial Number"];
            const productName = data["Product Name"];
            const inputImageUrls = data["Input Image Urls"];

            // Validate fields
            if (!serialNumber || !productName || !inputImageUrls) {
                errors.push({
                    row: rowNumber,
                    error: "Missing required fields",
                    data,
                });
                return;
            }

            // Process and validate URLs
            const urls = inputImageUrls
                .split(",")
                .map((url) => url.trim())
                .filter(Boolean);
            if (urls.length === 0) {
                errors.push({
                    row: rowNumber,
                    error: "Invalid Input Image Urls",
                    data,
                });
                return;
            }

            results.push({
                rowNumber,
                serialNumber,
                productName,
                inputImageUrls: urls,
            });
        })
        .on("end", async () => {
            if (errors.length > 0) {
                return responseSender(
                    {
                        status: BAD_REQUEST,
                        success: false,
                        message: "Invalid CSV file",
                        data: { errors },
                    },
                    res,
                );
            }

            for (let row of results) {
                const product = new ProductModel({
                    requestId,
                    serialNumber: row.serialNumber,
                    productName: row.productName,
                    inputImageUrls: row.inputImageUrls,
                });

                await product.save();
                ImageService.processImages(product);
            }

            return responseSender(
                {
                    status: OK,
                    success: true,
                    message: "Request submitted successfully",
                    data: { requestId },
                },
                res,
            );
        })
        .on("error", (error) => {
            console.error("Error reading CSV file:", error.message);
            res.status(500).json({ error: "Error processing CSV file" });
        });
});

const checkStatus = asyncHandler(async (req, res) => {
    const requestId = req.params.requestId;
    const products = await ProductModel.find({ requestId });

    return responseSender(
        {
            status: OK,
            success: true,
            message: "Request status",
            data: products,
        },
        res,
    );
});

module.exports = {
    uploadCSV,
    checkStatus,
};
