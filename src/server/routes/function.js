const express = require("express");
const router = express.Router();

const function_controller = require("../controllers/functionController");

router.get("/", function_controller.function_list);

module.exports = router;
