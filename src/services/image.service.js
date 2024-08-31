const { default: axios } = require("axios");
const { ProductModel, RequestModel } = require("../models");
const sharp = require("sharp");
const uuid = require("uuid");
const uploadToCloudinary = require("../helper/uploadToCloudinary");
const { generateOutputCSV } = require("../utils/csvUtils");
const env = require("../config/env");

const processImages = async (product) => {
    try {
        product.status = "PROCESSING";
        await product.save();

        const outputUrls = [];

        for (let url of product.inputImageUrls) {
            try {
                const imageResponse = await axios({
                    url,
                    responseType: "arraybuffer",
                });

                const buffer = await sharp(imageResponse.data).jpeg({ quality: 50 }).toBuffer();

                const cloudinaryFileName = `${uuid.v4()}`;
                const outputUrl = await uploadToCloudinary(buffer, cloudinaryFileName, "jpg");

                outputUrls.push(outputUrl);
            } catch (error) {
                console.error(`Error processing image ${url}:`, error.message);

                product.status = "FAILED";
                await product.save();

                await updateRequestStatus(product.requestId);

                return;
            }
        }

        product.outputImageUrls = outputUrls;
        product.status = "COMPLETED";
        await product.save();

        await updateRequestStatus(product.requestId);
    } catch (error) {
        console.error(`Failed to process images for product ${product.productName}:`, error.message);
        await markRequestAsFailed(product.requestId);
    }
};

const triggerWebhook = async (requestId) => {
    const webhookUrl = env.webhookUrl;

    if (!webhookUrl) {
        console.error("Webhook URL is not set");
        return;
    }

    try {
        const products = await ProductModel.find({ requestId, status: "COMPLETED" });
        const payload = products.map((product) => ({
            serialNumber: product.serialNumber,
            productName: product.productName,
            inputImageUrls: product.inputImageUrls,
            outputImageUrls: product.outputImageUrls,
        }));

        await generateOutputCSV(products, requestId);

        await axios.post(webhookUrl, payload);
        console.log("Webhook triggered successfully");
    } catch (error) {
        console.error("Error triggering webhook:", error.message);
    }
};

const updateRequestStatus = async (requestId) => {
    const productsPending = await ProductModel.find({ requestId, status: { $ne: "COMPLETED" } });

    if (productsPending.length === 0) {
        await RequestModel.updateOne({ requestId }, { status: "COMPLETED" });
        // await triggerWebhook(requestId);
    } else {
        const hasFailed = await ProductModel.findOne({ requestId, status: "FAILED" });
        if (hasFailed) {
            await RequestModel.updateOne({ requestId }, { status: "FAILED" });
        } else {
            await RequestModel.updateOne({ requestId }, { status: "PROCESSING" });
        }
    }
};

const markRequestAsFailed = async (requestId) => {
    await RequestModel.updateOne({ requestId }, { status: "FAILED" });
};

module.exports = { processImages };
