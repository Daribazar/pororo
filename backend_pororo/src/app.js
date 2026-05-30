require("dotenv").config();

const express = require("express");
const cors = require("cors");

const summaryRoutes = require("./routes/summary.routes");
const teacherRoutes = require("./routes/teacher.routes");
const committeeRoutes = require("./routes/committee.routes");
const studentRoutes = require("./routes/student.routes");
const topicRoutes = require("./routes/topic.routes");
const alertRoutes = require("./routes/alert.routes");
const thesisRoutes = require("./routes/thesis.routes");

const app = express();

app.use(cors());
app.use(express.json());

// Health check route.
// Frontend эсвэл Postman-оор backend ажиллаж байгаа эсэхийг шалгана.
app.get("/", (req, res) => {
  res.json({ message: "Smart Defense Analytics API is running" });
});

// API routes
app.use("/api/summary", summaryRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/committees", committeeRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/thesis", thesisRoutes);

module.exports = app;