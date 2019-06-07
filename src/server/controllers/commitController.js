const CommitData = require("../models/commit");

exports.commit_list = function(req, res) {
  CommitData.find()
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

exports.commit_detail = function(req, res) {
  const id = req.params.CommitId;
  CommitData.findById(id)
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

exports.commit_create = function(req, res) {
  const CommitData = new CommitData({
    revision: req.body.revision,
    author: req.body.author,
    date: req.body.date
  });
  CommitData.save()
    .then(result => {
      res.status(201).json({
        message: "Handling POST requests to /commits",
        createdCommit: result
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.commit_patch = function(req, res) {
  const id = req.params.CommitId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  CommitData.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Commit updated",
        url: "http://localhost:3000/api/commits/" + id
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.commit_delete = function(req, res) {
  const id = req.params.CommitId;
  CommitData.remove({ _id: id })
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
