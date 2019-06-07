const express = require("express");
const router = express.Router();

const report_controller = require("../controllers/reportController");

router.get("/", report_controller.report_list);

router.post("/", report_controller.report_create);

router.get("/:ReportId", report_controller.report_detail);

router.patch("/:ReportId", report_controller.report_patch);

router.delete("/:ReportId", report_controller.report_delete);

module.exports = router;
