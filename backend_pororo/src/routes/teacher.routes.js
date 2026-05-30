const express = require("express");
const controller = require("../controllers/teacher.controller");

const router = express.Router();

router.get("/", controller.getTeachers);
router.get("/analytics", controller.getTeacherAnalytics);
router.get("/:id", controller.getTeacherDetail);

module.exports = router;