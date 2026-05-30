const express = require("express");
const controller = require("../controllers/teacher.controller");

const router = express.Router();

router.get("/analytics", controller.getTeacherAnalytics);

module.exports = router;