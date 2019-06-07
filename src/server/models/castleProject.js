const mongoose = require("mongoose");

const exuSchema = mongoose.Schema({
  id: { type: String, required: true },
  type: { type: Number, required: true }
});

const projectSchema = mongoose.Schema(
  {
    oem: { type: String, required: true },
    proj_name: { type: String, required: true },
    functionID: { type: String },
    productID: { type: String },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Cprojects" },
    children: { type: [projectSchema] },
    updated: { type: Date, default: Date.now() },
    svn_url: { type: String, required: true },
    report_id: { type: mongoose.Schema.Types.ObjectId, ref: "Report" },
    commit_id: { type: mongoose.Schema.Types.ObjectId, ref: "Commit" },
    exu: exuSchema
  },
  {
    collection: "projects",
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

projectSchema.virtual("url_api").get(function() {
  return "http://localhost:3000/api/castleProjects/" + this._id;
});

projectSchema.virtual("url").get(function() {
  return "http://localhost:3000/castleProjects/" + this._id;
});

module.exports = mongoose.model("Project", projectSchema);
