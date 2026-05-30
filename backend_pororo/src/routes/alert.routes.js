const express = require("express");
const controller = require("../controllers/alert.controller");

const router = express.Router();

router.get("/", controller.getAlerts);

module.exports = router;