const express = require("express");
const controller = require("../controllers/topic.controller");

const router = express.Router();

router.get("/analytics", controller.getTopicAnalytics);

module.exports = router;