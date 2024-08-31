const cloudinary = require("cloudinary").v2;

async function uploadToCloudinary(buffer, fileName, format = "jpg") {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    public_id: fileName,
                    resource_type: "image",
                    format,
                    transformation: [{ quality: "auto:low" }],
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result.secure_url);
                },
            )
            .end(buffer);
    });
}

module.exports = uploadToCloudinary;
