const express = require("express");
const controller = require("../controllers/summary.controller");

const router = express.Router();

router.get("/", controller.getSummary);

module.exports = router;