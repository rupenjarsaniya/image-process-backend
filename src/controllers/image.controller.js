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

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", async () => {
            for (let row of results) {
                const product = new ProductModel({
                    requestId,
                    serialNumber: row["Serial Number"],
                    productName: row["Product Name"],
                    inputImageUrls: row["Input Image Urls"].split(",").map((url) => url.trim()),
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
