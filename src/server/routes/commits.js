const express = require("express");
const router = express.Router();

const commit_controller = require("../controllers/commitController");

router.get("/", commit_controller.commit_list);

router.post("/", commit_controller.commit_create);

router.get("/:CommitId", commit_controller.commit_detail);

router.patch("/:CommitId", commit_controller.commit_patch);

router.delete("/:CommitId", commit_controller.commit_delete);

module.exports = router;
