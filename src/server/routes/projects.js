const express = require("express");
const router = express.Router();

const project_controller = require("../controllers/projectController");

router.get("/", project_controller.project_list);

router.get("/stats", project_controller.stats_list);

router.get("/p2", project_controller.project_p2_list);

router.get("/stats/p2", project_controller.stats_p2_list);

router.post("/", project_controller.project_update);

router.post("/p2", project_controller.project_p2_update);

module.exports = router;
