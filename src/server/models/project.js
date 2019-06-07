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

const castleSchema = mongoose.Schema({
  num_ok: { type: Number, default: 0 },
  num_nok: { type: Number, default: 0 },
  num_np: { type: Number, default: 0 },
  num_ok_perc: { type: Number, default: 0 },
  num_nok_perc: { type: Number, default: 0 },
  num_np_perc: { type: Number, default: 0 }
});

const branchSchema = mongoose.Schema({
  url: { type: String, required: true },
  binariesResult: {
    type: jobSchema,
    default: { name: "", url: "", color: "secondary", msg: "N/A" }
  },
  compileResult: {
    type: jobSchema,
    default: { name: "", url: "", color: "secondary", msg: "N/A" }
  },
  klockResult: {
    type: jobSchema,
    default: { name: "", url: "", color: "secondary", msg: "N/A" }
  },
  prqaResult: {
    type: jobSchema,
    default: { name: "", url: "", color: "secondary", msg: "N/A" }
  },
  qacResult: {
    type: jobSchema,
    default: { name: "", url: "", color: "secondary", msg: "N/A" }
  },
  memoryResult: {
    type: jobSchema,
    default: { name: "", url: "", color: "secondary", msg: "N/A" }
  },
  castleResult: {
    type: castleSchema,
    default: {
      num_ok: 0,
      num_nok: 0,
      num_np: 0,
      num_ok_perc: 0,
      num_nok_perc: 0,
      num_np_perc: 0
    }
  }
});

const projectSchema = mongoose.Schema(
  {
    oem: { type: String, required: true },
    project_id: { type: String, required: true },
    id: { type: String, required: true },
    name: { type: String, required: true },
    updated: { type: Date, default: Date.now() },
    tag: branchSchema,
    trunk: branchSchema,
    stats_id: { type: mongoose.Schema.Types.ObjectId, ref: "jobStat" }
  },
  {
    collection: "cprojects",
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

projectSchema.virtual("url_api").get(function() {
  return "http://localhost:3000/api/projects/" + this._id;
});

module.exports = mongoose.model("Cprojects", projectSchema);
