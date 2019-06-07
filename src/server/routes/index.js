const express = require("express");
const router = express.Router();

router.get("*", function(req, res, next) {
  res.sendFile("index.html", { root: __dirname + "../../../../dist/" });
});

module.exports = router;
