const express = require("express");
const controller = require("../controllers/student.controller");

const router = express.Router();

router.get("/", controller.getAllStudents);
router.get("/search", controller.searchStudents);
router.get("/:id", controller.getStudentDetail);

module.exports = router;