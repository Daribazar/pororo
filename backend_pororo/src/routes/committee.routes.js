const express = require("express");
const controller = require("../controllers/committee.controller");

const router = express.Router();

router.get("/analytics", controller.getCommitteeAnalytics);

module.exports = router;