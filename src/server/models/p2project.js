const mongoose = require("mongoose");

const jobSchema = mongoose.Schema({
  name: {
    type: String,
    default: ""
  },
  url: {
    type: String,
    default: ""
  },
  color: {
    type: String,
    default: "secondary"
  },
  msg: {
    type: String,
    default: "N/A"
  }
});

const branchSchema = mongoose.Schema({
  url: { type: String },
  compileResult: {
    type: jobSchema,
    default: { name: "", url: "", color: "secondary", msg: "N/A" }
  },
  klockResult: {
    type: jobSchema,
    default: { name: "", url: "", color: "secondary", msg: "N/A" }
  },
  vcastResult: {
    type: jobSchema,
    default: { name: "", url: "", color: "secondary", msg: "N/A" }
  }
});

const projectSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    updated: { type: Date, default: Date.now() },
    tag: branchSchema,
    trunk: branchSchema,
    stats_id: { type: mongoose.Schema.Types.ObjectId, ref: "jobStat" }
  },
  {
    collection: "p2cprojects",
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

projectSchema.virtual("url_api").get(function() {
  return "http://localhost:3000/api/projects/" + this._id;
});

module.exports = mongoose.model("P2Cprojects", projectSchema);
