const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/upload");
const multipleUpladController = require("../controllers/upload-multiple");
const upload = require("../middleware/upload");
  router.post("/images/upload", upload.single("file"), uploadController.uploadFiles);
  router.post("/images/multiple-upload", multipleUpladController.multipleUpload);

module.exports = router;
