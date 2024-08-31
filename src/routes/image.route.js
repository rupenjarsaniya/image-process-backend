const express = require("express");
const { ImageController } = require("../controllers");
const upload = require("../middlewares/multer.middleware");

const router = express.Router();

router.post("/upload", upload.single("file"), ImageController.uploadCSV);
router.get("/status/:requestId", ImageController.checkStatus);

module.exports = router;
