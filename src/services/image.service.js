const { default: axios } = require("axios");
const { ProductModel, RequestModel } = require("../models");
const sharp = require("sharp");
const uuid = require("uuid");
const uploadToCloudinary = require("../helper/uploadToCloudinary");

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
                const outputUrl = await uploadToCloudinary(buffer, cloudinaryFileName, "jpg"); // Pass the format as 'jpg' or any other

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

const updateRequestStatus = async (requestId) => {
    const productsPending = await ProductModel.find({ requestId, status: { $ne: "COMPLETED" } });

    if (productsPending.length === 0) {
        await RequestModel.updateOne({ requestId }, { status: "COMPLETED" });
    } else {
        const hasFailed = await Product.findOne({ requestId, status: "FAILED" });
        if (hasFailed) {
            await RequestModel.updateOne({ requestId }, { status: "FAILED" });
        } else {
            await RequestModel.updateOne({ requestId }, { status: "PROCESSING" });
        }
    }
};

const markRequestAsFailed = async (requestId) => {
    await RequestModel.updateOne({ requestId }, { status: "failed" });
};

module.exports = { processImages };
