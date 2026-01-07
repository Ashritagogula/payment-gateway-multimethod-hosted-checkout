const express = require("express");
const { getTestMerchant } = require("../controllers/testController");

const router = express.Router();

router.get("/api/v1/test/merchant", getTestMerchant);

module.exports = router;
