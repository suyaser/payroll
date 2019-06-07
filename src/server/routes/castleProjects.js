const express = require("express");
const router = express.Router();

const project_controller = require("../controllers/castleProjectController");

router.get("/", project_controller.project_list);

router.get("/parent/:projectId", project_controller.project_list_parent);

router.post("/", project_controller.project_create);

router.post("/report/:ProjectId", project_controller.project_report_add);

router.post("/commit/:ProjectId", project_controller.project_commit_add);

router.get("/:ProjectId", project_controller.project_detail);

router.get("/jobs/:JobIdList", project_controller.project_job_list);

router.get("/job/:JobId", project_controller.project_job);

router.patch("/:ProjectId", project_controller.project_patch);

router.delete("/:ProjectId", project_controller.project_delete);

router.post("/update/all", project_controller.project_update_all);

router.post("/update", project_controller.project_update);

router.post("/run", project_controller.project_run);

router.post("/parent", project_controller.link_castle);

module.exports = router;
