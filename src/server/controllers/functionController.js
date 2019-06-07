const FunctionData = require("../models/function");

exports.function_list = function(req, res) {
  FunctionData.find()
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
