const express = require("express");
const multer = require("multer");
const { scoreThesis, getScores, getScoreByStudent } = require("../controllers/thesis.controller");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

router.post("/score", upload.single("pdf"), scoreThesis);
router.get("/scores", getScores);
router.get("/scores/:studentId", getScoreByStudent);

module.exports = router;
