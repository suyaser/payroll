const ReportData = require("../models/report");

exports.report_list = function(req, res) {
  ReportData.find()
    .exec()
    .then(docs => {
      res.status(200).json(docs);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.report_detail = function(req, res) {
  const id = req.params.ReportId;
  ReportData.findById(id)
    .exec()
    .then(doc => {
      if (doc) {
        res.status(200).json(doc);
      } else {
        res
          .status(404)
          .json({ message: "No valid entry found for provided ID" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.report_create = function(req, res) {
  const ReportData = new ReportData({
    num_of_Tests: req.body.num_of_Tests,
    num_passed: req.body.num_passed,
    num_failed: req.body.num_failed,
    num_std: req.body.num_std,
    coverage: req.body.coverage,
    sw_version: req.body.sw_version,
    project_id: req.body.project_id
  });
  ReportData.save()
    .then(result => {
      res.status(201).json({
        message: "Handling POST requests to /Reports",
        createdReport: result
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.report_patch = function(req, res) {
  const id = req.params.ReportId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  ReportData.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Report updated",
        url: "http://localhost:3000/api/reports/" + id
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.report_delete = function(req, res) {
  const id = req.params.ReportId;
  ReportData.remove({ _id: id })
    .exec()
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};
