const fs = require("fs");
const path = require("path");
const { parse } = require("json2csv");

async function generateOutputCSV(products, requestId) {
    const formattedProducts = products.map((product) => ({
        serialNumber: product.serialNumber,
        productName: product.productName,
        inputImageUrls: product.inputImageUrls.join(","),
        outputImageUrls: product.outputImageUrls.join(","),
    }));

    const fields = [
        { label: "Serial Number", value: "serialNumber" },
        { label: "Product Name", value: "productName" },
        { label: "Input Image Urls", value: "inputImageUrls" },
        { label: "Output Image Urls", value: "outputImageUrls" },
    ];

    const csv = parse(formattedProducts, { fields });

    const outputPath = path.join(__dirname, "../../uploads/outputs", `${requestId}.csv`);

    fs.writeFileSync(outputPath, csv, "utf8");

    console.log(`CSV file saved: ${requestId}.csv`);
}

module.exports = { generateOutputCSV };
